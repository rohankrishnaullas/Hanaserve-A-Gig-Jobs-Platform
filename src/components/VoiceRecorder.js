import React, { useState, useEffect, useRef } from 'react';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onTranscript, onStop, isListening, prompt, variant = 'default', onToggleListening, isSpeaking }) => {
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const fullTranscriptRef = useRef('');
  const sessionStartedAtRef = useRef(null);
  const hasSessionRef = useRef(false);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        // Skip if currently speaking to prevent echo
        if (isSpeaking) {
          console.log('Skipping recognition result - app is speaking');
          return;
        }

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const resultText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += resultText + ' ';
          } else {
            interimTranscript += resultText;
          }
        }

        const displayText = finalTranscript || interimTranscript;
        setLiveTranscript(displayText);

        if (finalTranscript) {
          fullTranscriptRef.current = `${fullTranscriptRef.current} ${finalTranscript}`.trim();
          if (onTranscript) {
            onTranscript(finalTranscript.trim());
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Auto-restart if no speech detected
          if (isListening) {
            setTimeout(() => {
              if (isListening) recognition.start();
            }, 1000);
          }
        }
      };

      recognition.onend = () => {
        console.log('Recognition ended, isListening:', isListening, 'isSpeaking:', isSpeaking);
        if (isListening && !isSpeaking) {
          // Auto-restart if still listening and not speaking
          setTimeout(() => {
            try {
              if (isListening && !isSpeaking && recognitionRef.current) {
                console.log('Restarting recognition');
                recognitionRef.current.start();
              }
            } catch (e) {
              console.log('Recognition already running');
            }
          }, 200);
        } else if (!isListening) {
          // Session finished by user
          if (hasSessionRef.current && onStop && fullTranscriptRef.current.trim()) {
            onStop({
              transcript: fullTranscriptRef.current.trim(),
              durationMs: sessionStartedAtRef.current
                ? Date.now() - sessionStartedAtRef.current
                : null
            });
          }
          hasSessionRef.current = false;
          sessionStartedAtRef.current = null;
          fullTranscriptRef.current = '';
          setLiveTranscript('');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, isListening, isSpeaking]);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening && !isSpeaking) {
      try {
        console.log('Starting recognition, isListening:', isListening, 'isSpeaking:', isSpeaking);
        fullTranscriptRef.current = '';
        hasSessionRef.current = true;
        sessionStartedAtRef.current = Date.now();
        setLiveTranscript('');
        recognitionRef.current.start();
      } catch (e) {
        console.log('Recognition already running:', e.message);
      }
    } else if (!isListening || isSpeaking) {
      try {
        console.log('Stopping recognition, isListening:', isListening, 'isSpeaking:', isSpeaking);
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
    }
  }, [isListening, isSpeaking]);

  if (!isSupported) {
    return (
      <div className="voice-recorder-error">
        <p>Your browser doesn't support voice recognition. Please use Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div className={`voice-recorder ${variant === 'floating' ? 'floating' : ''}`}>
      <div
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={onToggleListening}
        role="button"
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
      >
        <div className="voice-icon">
          🎙️
        </div>
        {isListening && (
          <>
            <div className="pulse-ring pulse-ring-1"></div>
            <div className="pulse-ring pulse-ring-2"></div>
            <div className="pulse-ring pulse-ring-3"></div>
          </>
        )}
      </div>
      {liveTranscript && (
        <div className="transcript">
          <p>{liveTranscript}</p>
        </div>
      )}
      {isListening && (
        <p className="listening-indicator">🎙️ Listening... Speak now</p>
      )}
    </div>
  );
};

export default VoiceRecorder;
