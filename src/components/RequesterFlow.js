import React, { useState, useEffect, useRef } from 'react';
import VoiceChatAssistant from './VoiceChatAssistant';
import ChatInput from './ChatInput';
import { requesterFlowSystemPrompt } from '../services/systemPrompts';
import { setConversationContext, getAIGreeting, resetConversation } from '../services/openAIService';
import './RequesterFlow.css';

const RequesterFlow = ({ userId, onJobCreated }) => {
  const [mode, setMode] = useState('voice'); // 'voice' | 'chat'
  const [conversationLog, setConversationLog] = useState([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const conversationEndRef = useRef(null);

  // Set conversation context when component mounts
  useEffect(() => {
    setConversationContext(requesterFlowSystemPrompt);
    
    // Cleanup: reset conversation only when component unmounts
    return () => {
      resetConversation();
    };
  }, []);

  // Send initial greeting when switching to chat mode for the first time
  useEffect(() => {
    const sendInitialGreeting = async () => {
      if (mode === 'chat' && !hasGreeted && conversationLog.length === 0) {
        setHasGreeted(true);
        try {
          const greeting = await getAIGreeting();
          setConversationLog([{ role: 'assistant', text: greeting, timestamp: new Date() }]);
        } catch (error) {
          console.error('Error getting initial greeting:', error);
        }
      }
    };
    sendInitialGreeting();
  }, [mode, hasGreeted, conversationLog.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationLog]);

  return (
    <div className="requester-flow">
      <div className="flow-header">
        <h1>🔍 Hire</h1>
        <div className="mode-toggle">
          <span className={`mode-option ${mode === 'chat' ? 'active' : ''}`} onClick={() => setMode('chat')}>Chat</span>
          <span className={`mode-option ${mode === 'voice' ? 'active' : ''}`} onClick={() => setMode('voice')}>Voice</span>
        </div>
      </div>

      <div className="conversation-wrapper">
        {conversationLog.map((entry, idx) => (
          <div key={idx} className={`conversation-bubble ${entry.role === 'user' ? 'user' : 'assistant'}`}>
            <p>{entry.text}</p>
          </div>
        ))}
        <div ref={conversationEndRef} />
      </div>

      {mode === 'voice' ? (
        <VoiceChatAssistant 
          systemPrompt={requesterFlowSystemPrompt}
          autoStart={false}
          onMessage={(role, text) => {
            setConversationLog(prev => [...prev, { role, text, timestamp: new Date() }]);
          }}
        />
      ) : (
        <ChatInput 
          onMessage={(role, text) => {
            setConversationLog(prev => [...prev, { role, text, timestamp: new Date() }]);
          }}
        />
      )}

      {/* Show examples in voice mode or when starting a new conversation in chat mode */}
      {(mode === 'voice' || conversationLog.length === 0) && (
        <div className="voice-examples">
          <h4>💡 Example jobs you can describe:</h4>
          <p>Dog walker needed, babysitter for kids, math tutor required, grocery shopping help, house cleaning, pet sitting, yard work, car washing, furniture moving, tech support needed</p>
        </div>
      )}
    </div>
  );
};

export default RequesterFlow;
