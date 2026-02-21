import React, { useState, useEffect, useRef, useCallback } from 'react';
import VoiceChatAssistant from './VoiceChatAssistant';
import ChatInput from './ChatInput';
import { providerFlowSystemPrompt, requesterFlowSystemPrompt } from '../services/systemPrompts';
import { setConversationContext, getAIGreeting, resetConversation } from '../services/openAIService';
import apiService from '../services/apiService';
import './Hana.css';

const Hana = ({ userId, onComplete, onJobCreated }) => {
  const [flowMode, setFlowMode] = useState('work'); // 'work' | 'hire'
  const [chatMode, setChatMode] = useState('voice'); // 'voice' | 'chat'
  const [conversationLog, setConversationLog] = useState([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [extractedData, setExtractedData] = useState({ name: '', skills: [], jobDetails: null });
  const [dataSaved, setDataSaved] = useState(false);
  const conversationEndRef = useRef(null);

  // Extract skills and job details from conversation
  const extractDataFromConversation = useCallback((messages) => {
    const skillKeywords = [
      'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning', 'hvac',
      'computer repair', 'tech support', 'tutoring', 'math tutor', 'english tutor',
      'dog walking', 'pet sitting', 'pet care', 'babysitting', 'child care', 'elderly care',
      'moving', 'furniture', 'delivery', 'courier', 'packing',
      'cooking', 'chef', 'catering', 'photography', 'graphic design', 'writing',
      'yard work', 'lawn care', 'gardening', 'landscaping', 'car washing', 'auto detailing',
      'house cleaning', 'deep cleaning', 'organizing', 'handyman', 'repairs'
    ];

    let name = '';
    const skills = new Set();
    let jobDescription = '';

    messages.forEach(msg => {
      const text = msg.text?.toLowerCase() || '';

      // Extract name from user messages
      if (msg.role === 'user') {
        const namePatterns = [
          /(?:my name is|i'm|i am|call me|this is)\s+([a-zA-Z]+)/i,
          /^([a-zA-Z]+)$/i
        ];
        for (const pattern of namePatterns) {
          const match = msg.text?.match(pattern);
          if (match && match[1] && match[1].length > 1 && match[1].length < 20) {
            name = match[1];
            break;
          }
        }

        // Extract skills
        skillKeywords.forEach(skill => {
          if (text.includes(skill.toLowerCase())) {
            skills.add(skill);
          }
        });

        // Collect job description text
        if (flowMode === 'hire') {
          jobDescription += ' ' + msg.text;
        }
      }
    });

    return {
      name,
      skills: Array.from(skills),
      jobDetails: flowMode === 'hire' && jobDescription.trim() ? {
        description: jobDescription.trim().slice(0, 500),
        title: skills.size > 0 ? `${Array.from(skills)[0]} needed` : 'Help needed'
      } : null
    };
  }, [flowMode]);

  // Save data to backend
  const saveToBackend = useCallback(async (data) => {
    if (dataSaved || !apiService.isAuthenticated()) return;

    try {
      if (flowMode === 'work' && data.skills.length > 0) {
        // Save as provider - using correct field names from backend DTO
        const providerData = {
          name: data.name || 'Service Provider',
          skills: data.skills,
          bio: `Service provider offering: ${data.skills.join(', ')}`,
          hourlyRate: 25,
          latitude: 37.7749,  // Default SF location
          longitude: -122.4194,
          city: 'San Francisco'
        };

        try {
          await apiService.createProvider(providerData);
          console.log('Provider saved to backend');
          setDataSaved(true);
          if (onComplete) onComplete(providerData);
        } catch (err) {
          if (err.message?.includes('already exists')) {
            // Update existing provider
            await apiService.updateProvider(providerData);
            console.log('Provider updated in backend');
            setDataSaved(true);
          } else {
            throw err;
          }
        }
      } else if (flowMode === 'hire' && data.jobDetails) {
        // Save as job request - using correct field names from backend DTO
        const jobData = {
          title: data.jobDetails.title,
          description: data.jobDetails.description,
          skills: data.skills,
          latitude: 37.7749,  // Default SF location
          longitude: -122.4194,
          address: 'San Francisco',
          city: 'San Francisco',
          estimatedDuration: 2
        };

        const response = await apiService.createJob(jobData);
        console.log('Job saved to backend:', response);
        setDataSaved(true);
        if (onJobCreated) onJobCreated(response.data);
      }
    } catch (error) {
      console.error('Failed to save to backend:', error);
    }
  }, [flowMode, dataSaved, onComplete, onJobCreated]);

  // Reset conversation when flow mode changes
  useEffect(() => {
    resetConversation();
    setConversationLog([]);
    setHasGreeted(false);
    setExtractedData({ name: '', skills: [], jobDetails: null });
    setDataSaved(false);

    const systemPrompt = flowMode === 'work' ? providerFlowSystemPrompt : requesterFlowSystemPrompt;
    setConversationContext(systemPrompt);
  }, [flowMode]);

  // Extract data from conversation as it progresses
  useEffect(() => {
    if (conversationLog.length > 2) {
      const data = extractDataFromConversation(conversationLog);
      setExtractedData(data);

      // Auto-save when we have enough data (at least some skills or job details)
      if ((data.skills.length >= 1 || data.jobDetails) && !dataSaved) {
        // Debounce: wait for conversation to settle before saving
        const timer = setTimeout(() => {
          saveToBackend(data);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [conversationLog, extractDataFromConversation, saveToBackend, dataSaved]);

  // Send initial greeting when switching to chat mode for the first time
  useEffect(() => {
    const sendInitialGreeting = async () => {
      if (chatMode === 'chat' && !hasGreeted && conversationLog.length === 0) {
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
  }, [chatMode, hasGreeted, conversationLog.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationLog]);

  const handleFlowModeChange = (mode) => {
    setFlowMode(mode);
  };

  const getExamples = () => {
    if (flowMode === 'work') {
      return {
        title: '💡 Example skills you can mention:',
        text: 'Dog walking, babysitting, tutoring, grocery shopping, house cleaning, pet sitting, yard work, car washing, moving help, tech support'
      };
    } else {
      return {
        title: '💡 Example jobs you can describe:',
        text: 'Dog walker needed, babysitter for kids, math tutor required, grocery shopping help, house cleaning, pet sitting, yard work, car washing, furniture moving, tech support needed'
      };
    }
  };

  const examples = getExamples();
  const systemPrompt = flowMode === 'work' ? providerFlowSystemPrompt : requesterFlowSystemPrompt;

  return (
    <div className="hana-container">
      <div className="hana-header">
        <h1>🌸 Hana</h1>
        <div className="flow-mode-toggle">
          <button
            className={`mode-button ${flowMode === 'work' ? 'active' : ''}`}
            onClick={() => handleFlowModeChange('work')}
          >
            💼 Find Work
          </button>
          <button
            className={`mode-button ${flowMode === 'hire' ? 'active' : ''}`}
            onClick={() => handleFlowModeChange('hire')}
          >
            🔍 Hire Help
          </button>
        </div>
        <div className="chat-mode-toggle">
          <span
            className={`mode-option ${chatMode === 'chat' ? 'active' : ''}`}
            onClick={() => setChatMode('chat')}
          >
            Chat
          </span>
          <span
            className={`mode-option ${chatMode === 'voice' ? 'active' : ''}`}
            onClick={() => setChatMode('voice')}
          >
            Voice
          </span>
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

      {chatMode === 'voice' ? (
        <VoiceChatAssistant
          systemPrompt={systemPrompt}
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
      {(chatMode === 'voice' || conversationLog.length === 0) && (
        <div className="voice-examples">
          <h4>{examples.title}</h4>
          <p>{examples.text}</p>
        </div>
      )}

      {/* Show extracted data and save status */}
      {extractedData.skills.length > 0 && (
        <div className="extracted-data">
          <h4>Detected Skills:</h4>
          <div className="skill-tags">
            {extractedData.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
          {dataSaved && (
            <p className="save-status">Saved to your profile</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Hana;
