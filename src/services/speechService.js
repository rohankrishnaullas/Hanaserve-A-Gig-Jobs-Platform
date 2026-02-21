import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { logError, logEvent } from '../utils/appInsights';

let recognizer = null;
let synthesizer = null;
let activeSynthesizer = null; // Track currently speaking synthesizer
let activeAudioElement = null; // Track the audio element we're playing
let audioContext = null; // Shared audio context for iOS
let isAudioUnlocked = false; // Track if audio has been unlocked on iOS
let preAuthorizedAudio = null; // Pre-created audio element for iOS
let recognizerHandlers = null; // Store handlers for mobile reinit

// Detect iOS (all iOS browsers use WebKit)
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detect mobile browsers (iOS and Android)
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Unlock audio for iOS - MUST be called from user gesture (click/tap)
export const unlockAudioForIOS = async () => {
  console.log('🔓 unlockAudioForIOS called, isIOS:', isIOS(), 'already unlocked:', isAudioUnlocked);
  
  if (isAudioUnlocked && preAuthorizedAudio) {
    console.log('✅ Audio already unlocked');
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    console.log('🔓 Unlocking audio for iOS/mobile...');
    
    try {
      // Create and resume audio context
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // iOS requires playing a silent sound to unlock
      const silentBuffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      console.log('✅ AudioContext silent buffer played');
    } catch (e) {
      console.log('⚠️ AudioContext setup error:', e);
    }
    
    // CRITICAL: Create and "prime" an Audio element during the user gesture
    // This authorizes future audio playback on iOS
    preAuthorizedAudio = new Audio();
    preAuthorizedAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAgAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAbD/g7MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    
    // Play the silent audio to authorize playback
    const playPromise = preAuthorizedAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('✅ iOS audio unlocked via HTML5 Audio play()');
          preAuthorizedAudio.pause();
          isAudioUnlocked = true;
          resolve();
        })
        .catch((err) => {
          console.log('⚠️ HTML5 Audio unlock failed:', err.message);
          // Even if it fails, we've attempted during user gesture
          isAudioUnlocked = true;
          resolve();
        });
    } else {
      isAudioUnlocked = true;
      resolve();
    }
    
    // Resume context if suspended
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('✅ AudioContext resumed');
      }).catch((e) => {
        console.log('⚠️ AudioContext resume failed:', e);
      });
    }
  });
};

// Initialize Speech Recognition
export const initializeSpeechRecognition = (onResult, onError, onInterimResult) => {
  // Store handlers for potential mobile reinit
  recognizerHandlers = { onResult, onError, onInterimResult };
  
  // Clean up existing recognizer first
  if (recognizer) {
    try {
      recognizer.stopContinuousRecognitionAsync();
      recognizer.close();
    } catch (e) {
      console.log('Error cleaning up old recognizer:', e);
    }
    recognizer = null;
  }
  
  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.REACT_APP_AZURE_SPEECH_KEY,
      process.env.REACT_APP_AZURE_SPEECH_REGION
    );
    
    speechConfig.speechRecognitionLanguage = 'en-US';
    speechConfig.enableDictation();
    
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    
    console.log('🎙️ Speech recognizer created successfully');
    
    // Real-time interim results (like Copilot)
    recognizer.recognizing = (s, e) => {
      console.log('🎤 Recognizing (interim):', e.result.text);
      if (onInterimResult && e.result.text) {
        onInterimResult(e.result.text);
      }
    };
    
    // Final recognized text
    recognizer.recognized = (s, e) => {
      console.log('✅ Recognition result:', e.result.reason, e.result.text);
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        console.log('✅ Speech recognized:', e.result.text);
        if (e.result.text && e.result.text.trim().length > 0) {
          onResult(e.result.text);
        }
      } else if (e.result.reason === sdk.ResultReason.NoMatch) {
        console.log('⚠️ No speech could be recognized');
      }
    };
    
    recognizer.canceled = (s, e) => {
      console.error('❌ Recognition canceled:', e.reason);
      if (e.reason === sdk.CancellationReason.Error) {
        console.error('❌ Error details:', e.errorDetails);
        onError(`Error: ${e.errorDetails}`);
      }
    };
    
    recognizer.sessionStarted = (s, e) => {
      console.log('🟢 Recognition session started');
    };
    
    recognizer.sessionStopped = (s, e) => {
      console.log('🔴 Recognition session stopped');
    };
    
    return recognizer;
  } catch (error) {
    console.error('❌ Failed to initialize speech recognizer:', error);
    logError(error, { operation: 'initializeSpeechRecognition' });
    onError(`Failed to initialize: ${error.message}`);
    return null;
  }
};

// Start listening
export const startListening = () => {
  console.log('🎤 startListening called, recognizer exists:', !!recognizer, 'isMobile:', isMobile());
  
  // MOBILE FIX: Reinitialize recognizer on mobile browsers before each listening session
  // This ensures the microphone permissions and recognizer state are fresh
  if (isMobile() && recognizerHandlers) {
    console.log('📱 Mobile detected - reinitializing recognizer for fresh session');
    initializeSpeechRecognition(
      recognizerHandlers.onResult,
      recognizerHandlers.onError,
      recognizerHandlers.onInterimResult
    );
  } else if (isMobile() && !recognizerHandlers) {
    console.error('❌ Cannot reinitialize on mobile - handlers not set. Call initializeSpeechRecognition first.');
  }
  
  if (recognizer) {
    try {
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log('✅ Speech recognition started successfully');
          logEvent('SpeechRecognitionStarted');
        },
        (err) => {
          console.error('❌ Failed to start recognition:', err);
          logError(new Error(err), { operation: 'startListening' });
        }
      );
    } catch (error) {
      console.error('❌ Exception in startListening:', error);
      logError(error, { operation: 'startListening', hasRecognizer: !!recognizer });
    }
  } else {
    console.error('❌ Cannot start listening - recognizer is null');
    logError(new Error('Recognizer is null'), { operation: 'startListening' });
  }
};

// Stop listening
export const stopListening = () => {
  if (recognizer) {
    try {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          console.log('Speech recognition stopped');
        },
        (err) => {
          console.error('Failed to stop recognition:', err);
        }
      );
    } catch (error) {
      console.error('Exception in stopListening:', error);
      logError(error, { operation: 'stopListening' });
    }
  }
};

// Initialize Text-to-Speech
export const initializeSpeechSynthesis = () => {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.REACT_APP_AZURE_SPEECH_KEY,
    process.env.REACT_APP_AZURE_SPEECH_REGION
  );
  
  // Set a natural voice with conversational style
  speechConfig.speechSynthesisVoiceName = 'en-US-AriaNeural';
  
  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
  synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  
  return synthesizer;
};

// Speak text - using audio element for proper stop control
export const speakText = (text, onComplete, onError) => {
  try {
    // Cancel any existing speech first
    stopSpeaking();
    
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.REACT_APP_AZURE_SPEECH_KEY,
      process.env.REACT_APP_AZURE_SPEECH_REGION
    );
    
    speechConfig.speechSynthesisVoiceName = 'en-US-AriaNeural';
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
    
    // Don't use audio output - we'll play it ourselves
    const tempSynthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
    activeSynthesizer = tempSynthesizer;
    
    console.log('🔊 Starting speech synthesis...');
    
    tempSynthesizer.speakTextAsync(
      text,
      result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log('✅ Speech synthesis completed, playing audio...');
          
          // Get the audio data and play it ourselves
          const audioData = result.audioData;
          const blob = new Blob([audioData], { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(blob);
          
          // On iOS, reuse the pre-authorized audio element
          // On other platforms, create a new one
          let audio;
          if (isIOS() && preAuthorizedAudio) {
            console.log('📱 iOS: Reusing pre-authorized audio element');
            audio = preAuthorizedAudio;
            audio.src = audioUrl;
          } else {
            audio = new Audio(audioUrl);
          }
          activeAudioElement = audio;
          
          audio.onended = () => {
            console.log('🔊 Audio playback finished');
            URL.revokeObjectURL(audioUrl);
            activeAudioElement = null;
            if (onComplete) onComplete();
          };
          
          audio.onerror = (e) => {
            console.error('❌ Audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
            activeAudioElement = null;
            // Try Web Audio API fallback
            console.log('📱 Trying Web Audio API fallback');
            playAudioWithWebAudioAPI(audioData, onComplete, onError);
          };
          
          // Set playback speed to 1.25x for faster speech
          audio.playbackRate = 1.25;
          
          // Mobile-friendly play with better error handling
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('🔊 Audio playing successfully at 1.25x speed');
              })
              .catch(err => {
                console.error('❌ Failed to play audio:', err);
                logError(new Error(err.message), { operation: 'audioPlayback', isIOS: isIOS() });
                // Try using Web Audio API as fallback
                console.log('📱 Trying Web Audio API fallback after play() failure');
                playAudioWithWebAudioAPI(audioData, onComplete, onError);
                URL.revokeObjectURL(audioUrl);
                activeAudioElement = null;
              });
          }
          
        } else if (result.reason === sdk.ResultReason.Canceled) {
          const cancellation = sdk.SpeechSynthesisCancellationDetails.fromResult(result);
          console.log('Speech synthesis canceled:', cancellation.reason);
          if (cancellation.reason === sdk.CancellationReason.Error) {
            console.error('Cancellation error:', cancellation.errorDetails);
            logError(new Error(cancellation.errorDetails), { operation: 'speechSynthesis', reason: 'canceled' });
            if (onError) onError(cancellation.errorDetails);
          }
        } else {
          console.error('Speech synthesis failed:', result.reason);
          logError(new Error('Speech synthesis failed'), { operation: 'speechSynthesis', reason: result.reason });
          if (onError) onError('Speech synthesis failed');
        }
        
        // Clean up synthesizer
        if (tempSynthesizer === activeSynthesizer) {
          activeSynthesizer = null;
        }
        tempSynthesizer.close();
      },
      error => {
        console.error('Speech synthesis error:', error);
        logError(error, { operation: 'speechSynthesis' });
        if (onError) onError(error);
        if (tempSynthesizer === activeSynthesizer) {
          activeSynthesizer = null;
        }
        tempSynthesizer.close();
      }
    );
  } catch (error) {
    console.error('Exception in speakText:', error);
    if (onError) onError(error.message);
  }
};

// Stop speaking immediately - stops both synthesizer and audio playback
export const stopSpeaking = () => {
  console.log('🔇 stopSpeaking called');
  
  // Stop the audio element first (this stops the actual sound)
  if (activeAudioElement) {
    console.log('🔇 Stopping audio playback');
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement = null;
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }
  
  // Then close the synthesizer
  if (activeSynthesizer) {
    console.log('🔇 Closing synthesizer');
    try {
      activeSynthesizer.close();
      activeSynthesizer = null;
    } catch (error) {
      console.error('Error closing synthesizer:', error);
    }
  }
  
  console.log('✅ Speech stopped');
};

// Check if currently speaking
export const isSpeakingNow = () => {
  return activeAudioElement !== null && !activeAudioElement.paused;
};

// Web Audio API fallback for mobile browsers
const playAudioWithWebAudioAPI = async (audioData, onComplete, onError) => {
  try {
    console.log('🎵 Using Web Audio API for playback');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));
    
    // Create source
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    source.onended = () => {
      console.log('🔊 Web Audio playback finished');
      audioContext.close();
      if (onComplete) onComplete();
    };
    
    // Start playback
    source.start(0);
    console.log('✅ Web Audio playback started');
  } catch (error) {
    console.error('❌ Web Audio API failed:', error);
    if (onError) onError('Web Audio playback failed: ' + error.message);
  }
};

// Clean up resources
export const cleanup = () => {
  console.log('🧹 Cleanup called, recognizer exists:', !!recognizer);
  if (recognizer) {
    try {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          console.log('✅ Recognizer stopped successfully');
          if (recognizer) {
            recognizer.close();
            recognizer = null;
          }
        },
        (err) => {
          console.error('❌ Error stopping recognizer:', err);
          if (recognizer) {
            try {
              recognizer.close();
            } catch (e) {
              console.error('❌ Error closing recognizer:', e);
            }
            recognizer = null;
          }
        }
      );
    } catch (error) {
      console.error('❌ Exception in cleanup:', error);
      recognizer = null;
    }
  }
  if (synthesizer) {
    try {
      synthesizer.close();
    } catch (error) {
      console.error('Exception closing synthesizer:', error);
    }
    synthesizer = null;
  }
};
