import React, { useState, useEffect } from 'react';
import './VoiceChat.css';
import {
  initializeSpeechRecognition,
  startListening,
  stopListening,
  speakText,
  cleanup
} from '../services/speechService';
import { getAIResponse } from '../services/openAIService';

const VoiceChat = ({ onMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('Ready to chat');
  const [error, setError] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  useEffect(() => {
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
      setStatus('Processing your message...');
      onMessage('user', text);
      
      try {
        // Get AI response
        const response = await getAIResponse(text);
        onMessage('assistant', response);
        
        // Speak the response
        setStatus('Speaking response...');
        setIsSpeaking(true);
        
        speakText(
          response,
          () => {
            setIsSpeaking(false);
            
            // If call is still active, resume listening
            if (isCallActive) {
              setStatus('Listening... Your turn to speak');
              setIsListening(true);
              startListening();
            } else {
              setStatus('Ready to chat');
            }
          },
          (err) => {
            setIsSpeaking(false);
            setError('Failed to speak response');
            
            // Resume listening even if speech failed
            if (isCallActive) {
              setStatus('Listening... Your turn to speak');
              setIsListening(true);
              startListening();
            } else {
              setStatus('Ready to chat');
            }
          }
        );
      } catch (err) {
        setError(err.message);
        
        // Resume listening even if AI response failed
        if (isCallActive) {
          setStatus('Listening... Your turn to speak');
          setIsListening(true);
          startListening();
        } else {
          setStatus('Ready to chat');
        }
      }
    };

    const handleError = (err) => {
      console.error('❌ Speech error:', err);
      setError(err);
      setIsListening(false);
      setInterimTranscript('');
      
      if (isCallActive) {
        setStatus('Error occurred, restarting...');
        setTimeout(() => {
          console.log('🔄 Restarting recognition after error');
          setError(null);
          setIsListening(true);
          startListening();
        }, 1500);
      } else {
        setStatus('Ready to chat');
      }
    };
    
    const handleInterimResult = (text) => {
      console.log('💬 Interim result:', text);
      setInterimTranscript(text);
    };

    initializeSpeechRecognition(handleResult, handleError, handleInterimResult);

    return () => {
      cleanup();
    };
  }, [onMessage, isCallActive]);

  const handleMicClick = () => {
    console.log('🎯 Mic button clicked, isCallActive:', isCallActive);
    setError(null);
    setInterimTranscript('');
    
    if (isCallActive) {
      // End the call
      console.log('🛑 Ending call');
      stopListening();
      setIsListening(false);
      setIsCallActive(false);
      setStatus('Call ended');
      setTimeout(() => setStatus('Ready to chat'), 2000);
    } else {
      // Start the call
      console.log('🟢 Starting call');
      setIsCallActive(true);
      setIsListening(true);
      setStatus('Listening... Speak now');
      
      // Small delay to ensure state updates, then start
      setTimeout(() => {
        console.log('▶️ Calling startListening()');
        startListening();
      }, 100);
    }
  };

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
      
      <div className="status-bar">
        <span className={`status-indicator ${isListening ? 'listening' : isSpeaking ? 'speaking' : ''}`}>
          {isListening && '🎤 '}
          {isSpeaking && '🔊 '}
          {status}
        </span>
      </div>

      <div className="controls">
        <button
          className={`mic-button ${isCallActive ? 'active' : ''} ${isSpeaking ? 'disabled' : ''}`}
          onClick={handleMicClick}
          disabled={isSpeaking}
          aria-label={isCallActive ? 'End call' : 'Start call'}
        >
          <div className="mic-icon">
            {isCallActive ? '📞' : '🎤'}
          </div>
          <span className="mic-label">
            {isCallActive ? 'End Call' : 'Start Call'}
          </span>
        </button>
      </div>

      <div className="help-text">
        {!isCallActive && !isSpeaking && (
          <p>Click to start a continuous voice conversation</p>
        )}
        {isCallActive && isListening && (
          <p>Speak now... I'm listening</p>
        )}
        {isCallActive && isSpeaking && (
          <p>AI is responding... Please wait</p>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;
