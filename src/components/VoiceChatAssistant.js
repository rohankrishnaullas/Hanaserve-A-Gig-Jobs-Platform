import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceChat.css';
import {
  initializeSpeechRecognition,
  startListening,
  stopListening,
  speakText,
  stopSpeaking,
  cleanup,
  unlockAudioForIOS
} from '../services/speechService';
import { getAIResponse, getAIGreeting, setConversationContext } from '../services/openAIService';
import { logEvent } from '../utils/appInsights';

const VoiceChatAssistant = ({ onMessage, systemPrompt, autoStart = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const hasGreeted = useRef(false);
  const isCallActiveRef = useRef(false); // Use ref to track isCallActive in callbacks

  useEffect(() => {
    // Set conversation context when component mounts
    if (systemPrompt) {
      setConversationContext(systemPrompt);
    }

    // Initialize speech recognition
    const handleResult = async (text) => {
      console.log('📝 handleResult called with:', text);
      setInterimTranscript(''); // Clear interim transcript
      
      if (!text || text.trim() === '') {
        console.log('⚠️ Empty text, ignoring');
        return;
      }
      
      // Stop listening while processing
      stopListening();
      setIsListening(false);
      if (onMessage) onMessage('user', text);
      
      try {
        // Get AI response
        const response = await getAIResponse(text);
        if (onMessage) onMessage('assistant', response);
        
        // Remove emojis and special characters for TTS
        const cleanResponse = response.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        
        // Speak the response
        setIsSpeaking(true);
        
        speakText(
          cleanResponse,
          () => {
            setIsSpeaking(false);
            
            // Use ref to check current state - fixes second round bug
            if (isCallActiveRef.current) {
              setIsListening(true);
              startListening();
            } else {
            }
          },
          (err) => {
            setIsSpeaking(false);
            setError('Failed to speak response');
            
            // Use ref to check current state
            if (isCallActiveRef.current) {
              setIsListening(true);
              startListening();
            } else {
            }
          }
        );
      } catch (err) {
        setError(err.message);
        
        // Use ref to check current state
        if (isCallActiveRef.current) {
          setIsListening(true);
          startListening();
        } else {
        }
      }
    };

    const handleError = (err) => {
      console.error('❌ Speech error:', err);
      setError(err);
      setIsListening(false);
      setInterimTranscript('');
      
      if (isCallActiveRef.current) {
        setTimeout(() => {
          console.log('🔄 Restarting recognition after error');
          setError(null);
          setIsListening(true);
          startListening();
        }, 1500);
      } else {
      }
    };
    
    const handleInterimResult = (text) => {
      console.log('💬 Interim result:', text);
      setInterimTranscript(text);
    };

    initializeSpeechRecognition(handleResult, handleError, handleInterimResult);

    return () => {
      // Only cleanup on final unmount, not on every re-render
      console.log('🧹 Component cleanup');
    };
  }, [onMessage, systemPrompt]); // Removed isCallActive from dependencies

  // Cleanup on final unmount
  useEffect(() => {
    return () => {
      console.log('🛑 Component unmounting - cleaning up');
      cleanup();
      // Note: Not resetting conversation here - parent component handles that
      // This allows conversation history to be preserved when switching modes
    };
  }, []);

  const handleMicClick = useCallback(async () => {
    console.log('🎯 Mic button clicked, isCallActive:', isCallActive);
    setError(null);
    setInterimTranscript('');
    
    if (isCallActive) {
      // End the call - stop everything immediately
      console.log('🛑 Ending call (keeping conversation history)');
      logEvent('VoiceAction', { 
        action: 'endCall', 
        timestamp: new Date().toISOString(),
        wasListening: isListening,
        wasSpeaking: isSpeaking
      });
      stopSpeaking(); // Stop AI if speaking
      stopListening();
      setIsListening(false);
      setIsSpeaking(false);
      setIsCallActive(false);
      isCallActiveRef.current = false; // Update ref
      hasGreeted.current = false;
      // NOTE: Not resetting conversation - context is preserved for next call
    } else {
      // Start the call with AI greeting
      console.log('🟢 Starting call with AI greeting');
      logEvent('VoiceAction', { 
        action: 'startCall', 
        timestamp: new Date().toISOString()
      });
      
      // CRITICAL: Unlock audio for iOS FIRST (must happen in user gesture)
      // DO NOT await - must be synchronous to keep user gesture chain intact
      unlockAudioForIOS();
      
      setIsCallActive(true);
      isCallActiveRef.current = true; // Update ref
      setIsSpeaking(true);
      
      try {
        // Get AI's opening greeting
        const greeting = await getAIGreeting();
        if (onMessage) onMessage('assistant', greeting);
        
        // Remove emojis for TTS
        const cleanGreeting = greeting.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        
        // Speak the greeting
        speakText(
          cleanGreeting,
          () => {
            setIsSpeaking(false);
            setIsListening(true);
            
            // Start listening after greeting
            setTimeout(() => {
              console.log('▶️ Calling startListening()');
              startListening();
            }, 100);
          },
          (err) => {
            setIsSpeaking(false);
            setError('Failed to speak greeting');
            setIsCallActive(false);
            isCallActiveRef.current = false;
          }
        );
      } catch (err) {
        setError('Failed to start conversation');
        setIsCallActive(false);
        isCallActiveRef.current = false;
        setIsSpeaking(false);
      }
    }
  }, [isCallActive, isListening, isSpeaking, onMessage]);

  // Interrupt button handler
  const handleInterruptClick = () => {
    console.log('⏸️ Interrupt button clicked');
    logEvent('VoiceAction', { 
      action: 'interrupt', 
      timestamp: new Date().toISOString()
    });
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setIsListening(true);
      
      // Start listening immediately
      setTimeout(() => {
        startListening();
      }, 100);
    }
  };

  // Auto-start conversation if enabled
  useEffect(() => {
    if (autoStart && !hasGreeted.current && !isCallActive) {
      console.log('🚀 Auto-starting conversation');
      hasGreeted.current = true;
      // Use setTimeout to ensure component is fully mounted
      setTimeout(() => {
        handleMicClick();
      }, 500);
    }
  }, [autoStart, isCallActive, handleMicClick]);

  return (
    <div className="voice-chat">
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      
      {interimTranscript && isListening && (
        <div className="interim-transcript">
          <span className="interim-label">Listening...</span>
          <span className="interim-text">{interimTranscript}</span>
        </div>
      )}
      
      {isSpeaking && isCallActive && (
        <div className="interim-transcript speaking">
          <span className="interim-label">Hana is speaking...</span>
          <span className="interim-text">Responding to you</span>
        </div>
      )}

      <div className="controls">
        {/* Interrupt Button - only shown when AI is speaking */}
        {isSpeaking && isCallActive && (
          <button
            className="action-button interrupt"
            onClick={handleInterruptClick}
            aria-label="Interrupt Hana"
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            <span className="action-label">Interrupt</span>
          </button>
        )}
        
        {/* Main Call Button */}
        <button
          className={`action-button main ${isCallActive ? 'active' : ''}`}
          onClick={handleMicClick}
          aria-label={isCallActive ? 'End call' : 'Start call'}
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            {isCallActive ? (
              // End call icon (phone with X)
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 003.48.56 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.56 3.48 1 1 0 01-.27 1.11l-2.17 2.2z" />
            ) : (
              // Phone icon
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.36 11.36 0 003.48.56 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.56 3.48 1 1 0 01-.27 1.11l-2.17 2.2z" />
            )}
          </svg>
          <span className="action-label">
            {isCallActive ? 'End Call' : 'Start Call'}
          </span>
        </button>
      </div>

      <div className="help-text">
        {!isCallActive && !isSpeaking && (
          <p>Click to start a voice conversation with Hana</p>
        )}
        {isCallActive && isListening && (
          <p>Speak now... Hana is listening</p>
        )}
        {isCallActive && isSpeaking && (
          <p>Hana is speaking... Click Interrupt to speak</p>
        )}
      </div>
    </div>
  );
};

export default VoiceChatAssistant;
