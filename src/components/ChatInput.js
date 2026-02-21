import React, { useState } from 'react';
import { getAIResponse } from '../services/openAIService';
import './ChatInput.css';

const ChatInput = ({ onMessage, disabled = false }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim() || isProcessing || disabled) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    setIsProcessing(true);
    
    // Send user message to parent
    if (onMessage) onMessage('user', userMessage);
    
    try {
      // Get AI response
      const response = await getAIResponse(userMessage);
      
      // Send assistant message to parent
      if (onMessage) onMessage('assistant', response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      if (onMessage) onMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          className="chat-input"
          placeholder={isProcessing ? "Processing..." : "Type your message..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isProcessing || disabled}
          autoFocus
        />
        <button 
          type="submit" 
          className="chat-send-button"
          disabled={!inputText.trim() || isProcessing || disabled}
        >
          {isProcessing ? '...' : '➤'}
        </button>
      </form>
      {isProcessing && (
        <div className="processing-indicator">
          <span className="processing-dot"></span>
          <span className="processing-dot"></span>
          <span className="processing-dot"></span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
