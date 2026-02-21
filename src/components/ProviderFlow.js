import React, { useState, useEffect, useRef } from 'react';
import VoiceChatAssistant from './VoiceChatAssistant';
import ChatInput from './ChatInput';
import { getProviderById } from '../utils/storage';
import { providerFlowSystemPrompt } from '../services/systemPrompts';
import { setConversationContext, getAIGreeting, resetConversation } from '../services/openAIService';
import './ProviderFlow.css';

const ProviderFlow = ({ userId, onComplete }) => {
  const [mode, setMode] = useState('voice'); // 'voice' | 'chat'
  const [skills, setSkills] = useState([]);
  const [conversationLog, setConversationLog] = useState([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const conversationEndRef = useRef(null);

  // Set conversation context when component mounts
  useEffect(() => {
    setConversationContext(providerFlowSystemPrompt);
    
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

  useEffect(() => {
    // Try to get existing provider data
    if (userId) {
      const existing = getProviderById(userId);
      if (existing) {
        setSkills(existing.skills || []);
        // setLocation(existing.location);
        // setName(existing.name || '');
        // if (existing.skills && existing.skills.length > 0) {
        //   setStep(3); // Skip to job notifications if already set up
        // }
      }
    }
  }, [userId]);

  /* Commented out unused geolocation code
  useEffect(() => {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            city: 'Current Location' // Will be enhanced later
          });
        },
        () => {
          // Fallback to manual entry
          setLocation({ city: 'Not set' });
        }
      );
    } else {
      setLocation({ city: 'Not set' });
    }
  }, []);
  */

  /* Commented out unused function
  const handleTranscript = (text) => {
    console.log('Transcript received:', text, 'Step:', step);
    if (!text || text.trim().length < 3) return;

    // If speaking and user interrupts, stop speaking
    if (isSpeaking) {
      console.log('User interrupted, cancelling speech');
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (step === 1) {
      // Getting name - extract from patterns like "My name is X" or "I'm X" or just "X"
      let extractedName = text;
      const namePatterns = [
        /(?:my name is|i'm|i am|this is|call me)\s+([\w\s]+)/i,
        /^([\w\s]+)$/
      ];
      
      for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match) {
          extractedName = match[1] || match[0];
          break;
        }
      }
      
      extractedName = extractedName.trim();
      setName(extractedName);
      setConversationLog(prev => [...prev, { type: 'user', text }]);
      // setIsListening(false);
      setTimeout(() => {
        setConversationLog(prev => [...prev, { type: 'app', text: `Nice to meet you, ${extractedName}! What skills or jobs can you do?` }]);
        setStep(2);
      }, 500);
    } else if (step === 2) {
      // Getting skills
      console.log('Step 2: Processing skills input:', text);
      setConversationLog(prev => [...prev, { type: 'user', text }]);
      // setIsListening(false);
      
      const newSkills = text.split(/[,\s]+and\s+|,|\sand\s/).map(s => s.trim()).filter(s => s.length > 2);
      if (newSkills.length > 0) {
        const updated = [...skills, ...newSkills];
        setSkills(updated);
        const similar = findSimilarSkills(updated);
        setSuggestedSkills(similar);
        
        setTimeout(() => {
          setConversationLog(prev => [...prev, 
            { type: 'app', text: `Got it! I've saved: ${newSkills.join(', ')}. Can you also do ${similar.slice(0, 2).join(' or ')}?` }
          ]);
          setStep(3);
        }, 500);
      }
    } else if (step === 3) {
      // Responding to skill suggestions
      const lowerText = text.toLowerCase();
      if (lowerText.includes('yes') || lowerText.includes('yeah') || lowerText.includes('sure') || lowerText.includes('can')) {
        // Add suggested skills
        const toAdd = suggestedSkills.filter(s => 
          !skills.some(existing => existing.toLowerCase().includes(s.toLowerCase()))
        );
        if (toAdd.length > 0) {
          setSkills(prev => [...prev, ...toAdd.slice(0, 2)]);
          setConversationLog(prev => [...prev, 
            { type: 'user', text },
            { type: 'app', text: `Great! I've added those to your skills. You're all set!` }
          ]);
        }
      } else {
        setConversationLog(prev => [...prev, 
          { type: 'user', text },
          { type: 'app', text: `No problem! You're all set with your current skills.` }
        ]);
      }
      
      setTimeout(() => {
        finishSetup();
      }, 2000);
    }
  };
  */

  /* Commented out unused function
  const finishSetup = () => {
    const providerData = {
      id: userId || `provider_${Date.now()}`,
      name: name || 'Provider',
      skills: [...new Set(skills)], // Remove duplicates
      location,
      createdAt: new Date().toISOString()
    };
    
    saveProvider(providerData);
    setConversationLog(prev => [...prev, 
      { type: 'app', text: `Perfect! I'll notify you when someone needs your services nearby.` }
    ]);
    
    setTimeout(() => {
      if (onComplete) onComplete(providerData);
    }, 2000);
  };
  */

  // const startListening = () => {
  //   setIsListening(true);
  //   if (step === 1) {
  //     setConversationLog([{ type: 'app', text: 'Hello! I\\'m here to help you find gigs. Tell me your name first, then we\\'ll set up your skills profile.' }]);
  //   } else if (step === 2) {
  //     setConversationLog(prev => [...prev, { type: 'app', text: 'Great! Now tell me what skills or jobs you can do. For example: \"I can walk dogs, babysit children, tutor math, do grocery shopping, or help with house cleaning.\"' }]);
  //   }
  // };

  // const stopListening = () => {
  //   setIsListening(false);
  // };

  // const sendChatMessage = (e) => {
  //   e?.preventDefault();
  //   if (!chatInput.trim()) return;
  //   handleTranscript(chatInput.trim());
  //   setChatInput('');
  // };

  // const handleRecordingStop = async ({ transcript, durationMs }) => {
  //   if (!transcript || transcript.trim().length < 5) return;
  //   const analysis = await analyzeProviderConversation(transcript, skills);
  //   setSkills(prev => {
  //     const merged = [...new Set([...prev, ...analysis.skills])];
  //     return merged;
  //   });

  //   const summaryLines = [
  //     `Here's what I heard: ${analysis.summary || transcript.slice(0, 120)}${analysis.summary ? '' : '...'}`,
  //     analysis.skills.length ? `I captured these skills: ${analysis.skills.slice(0, 5).join(', ')}` : null,
  //     analysis.qualifications.length ? `Qualifications noted: ${analysis.qualifications.join(', ')}` : null
  //   ].filter(Boolean);

  //   setConversationLog(prev => ([
  //     ...prev,
  //     { type: 'app', text: summaryLines.join(' • ') },
  //     ...(analysis.followUpQuestions.length > 0
  //       ? [{ type: 'app', text: analysis.followUpQuestions[0] }]
  //       : [])
  //   ]));

  //   saveConversationRecord({
  //     id: `conv_${Date.now()}`,
  //     userId: userId || 'anonymous_provider',
  //     role: 'provider',
  //     transcript: transcript.trim(),
  //     summary: analysis.summary,
  //     skills: analysis.skills,
  //     qualifications: analysis.qualifications,
  //     interests: analysis.interests,
  //     followUpQuestions: analysis.followUpQuestions,
  //     durationMs,
  //     createdAt: new Date().toISOString()
  //   });
  // };

  // const getPrompt = () => {
  //   if (step === 1) return 'Tell me your name';
  //   if (step === 2) return 'Tell me what jobs you can do';
  //   if (step === 3) return suggestedSkills.length > 0 
  //     ? `Can you do ${suggestedSkills.slice(0, 2).join(' or ')}?` 
  //     : 'You\'re all set!';
  //   return '';
  // };

  // const toggleListening = () => {
  //   if (mode !== 'voice') return;
  //   if (!isListening) {
  //     startListening();
  //   } else {
  //     stopListening();
  //   }
  // };

  return (
    <div className="provider-flow">
      <div className="flow-header">
        <h1>💼 Work</h1>
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
          systemPrompt={providerFlowSystemPrompt}
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
          <h4>💡 Example skills you can mention:</h4>
          <p>Dog walking, babysitting, tutoring, grocery shopping, house cleaning, pet sitting, yard work, car washing, moving help, tech support</p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="skills-display">
          <h3>Your Skills:</h3>
          <div className="skills-list">
            {skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderFlow;
