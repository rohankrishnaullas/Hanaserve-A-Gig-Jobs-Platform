import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { generalChatSystemPrompt } from './systemPrompts';
import { logEvent, logError, logMetric } from '../utils/appInsights';

let openAIClient = null;
let conversationHistory = [];
let currentSystemPrompt = generalChatSystemPrompt;

// Initialize Azure OpenAI client
const getClient = () => {
  if (!openAIClient) {
    openAIClient = new OpenAIClient(
      process.env.REACT_APP_AZURE_OPENAI_ENDPOINT,
      new AzureKeyCredential(process.env.REACT_APP_AZURE_OPENAI_API_KEY)
    );
  }
  return openAIClient;
};

// Set context for conversation
export const setConversationContext = (systemPrompt) => {
  currentSystemPrompt = systemPrompt;
  console.log('📝 Conversation context set');
  logEvent('ConversationContextSet', { promptLength: systemPrompt?.length });
};

// Get AI's opening message (for proactive conversation start)
export const getAIGreeting = async () => {
  const client = getClient();
  const deploymentName = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME;
  
  // Check if we have existing conversation history
  const hasPreviousContext = conversationHistory.length > 0;
  
  const messages = [
    {
      role: 'system',
      content: currentSystemPrompt
    },
    // Include previous conversation if exists
    ...conversationHistory,
    {
      role: 'user',
      content: hasPreviousContext 
        ? 'Continue our conversation. Welcome me back briefly and remind me what we were discussing.'
        : 'Start the conversation by greeting me and explaining how you can help.'
    }
  ];
  
  try {
    const result = await client.getChatCompletions(deploymentName, messages, {
      maxCompletionTokens: 150,
    });
    
    const greeting = result.choices[0].message.content;
    
    // Add to conversation history
    conversationHistory.push({
      role: 'assistant',
      content: greeting
    });
    
    console.log(hasPreviousContext ? '🔄 Continuing previous conversation' : '🆕 Starting new conversation');
    
    // Log AI greeting received
    logEvent('AIMessageReceived', {
      messageType: 'greeting',
      messageLength: greeting?.length,
      hasPreviousContext,
      conversationLength: conversationHistory.length
    });
    
    return greeting;
  } catch (error) {
    console.error('Error getting AI greeting:', error);
    logError(error, { operation: 'getAIGreeting', hasPreviousContext });
    throw new Error('Failed to start conversation: ' + error.message);
  }
};

// Get AI response
export const getAIResponse = async (userMessage) => {
  const client = getClient();
  const deploymentName = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME;
  
  // Add user message to conversation history
  conversationHistory.push({
    role: 'user',
    content: userMessage
  });
  
  // Log user message sent
  logEvent('UserMessageSent', {
    messageLength: userMessage?.length,
    conversationLength: conversationHistory.length
  });
  
  // Build messages with system prompt
  const messages = [
    {
      role: 'system',
      content: currentSystemPrompt
    },
    ...conversationHistory
  ];
  
  try {
    const startTime = performance.now();
    const result = await client.getChatCompletions(deploymentName, messages, {
      maxCompletionTokens: 150,
    });
    const duration = performance.now() - startTime;
    
    const assistantMessage = result.choices[0].message.content;
    
    // Log performance metrics
    logMetric('AIResponseTime', duration, { messageCount: conversationHistory.length });
    logEvent('AIMessageReceived', { 
      messageType: 'response',
      responseLength: assistantMessage?.length,
      conversationLength: conversationHistory.length,
      duration 
    });
    
    // Add assistant response to conversation history
    conversationHistory.push({
      role: 'assistant',
      content: assistantMessage
    });
    
    // Keep only last 10 messages to avoid token limits
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
    
    return assistantMessage;
  } catch (error) {
    console.error('Error getting AI response:', error);
    logError(error, { 
      operation: 'getAIResponse',
      messageLength: userMessage?.length,
      conversationLength: conversationHistory.length 
    });
    throw new Error('Failed to get AI response: ' + error.message);
  }
};

// Reset conversation
export const resetConversation = () => {
  conversationHistory = [];
  currentSystemPrompt = generalChatSystemPrompt;
  console.log('🔄 Conversation reset');
  logEvent('ConversationReset');
};
