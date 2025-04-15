// Main.js with enhanced agent-specific handling and fixed customer satisfaction analytics

import VoiceDataIntegration from './voice-data-integration.js';
import VoiceDataVisualization from './voice-data-visualization.js';

// Global variables
let chatMessages = [];
let isProcessing = false;
let voiceDataIntegration = null;
let voiceDataVisualization = null;

// Initialize the application
async function initialize() {
  console.log("Initializing Dental AI Application...");
  
  try {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize voice data integration
    voiceDataIntegration = new VoiceDataIntegration();
    await voiceDataIntegration.initialize();
    
    // Initialize voice data visualization
    voiceDataVisualization = new VoiceDataVisualization(voiceDataIntegration);
    voiceDataVisualization.initialize();
    
    // Add initial message
    addSystemMessage("Welcome to the Dental AI Assistant. I can help you analyze voice data from customer service calls at your dental clinic. You can ask me about agent performance, customer satisfaction, and more.");
    
    // Update UI to show data is loaded
    updateUIForDataLoaded();
    
    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
    addSystemMessage("There was an error initializing the application. Please try refreshing the page.");
  }
}

// Set up event listeners
function setupEventListeners() {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const fileInput = document.getElementById('file-input');
  const fileButton = document.getElementById('file-button');
  const voiceToggle = document.getElementById('voice-toggle');
  
  // Chat form submit event
  chatForm.addEventListener('submit', handleChatSubmit);
  
  // Send button click event
  sendButton.addEventListener('click', () => {
    chatForm.dispatchEvent(new Event('submit'));
  });
  
  // File button click event
  fileButton.addEventListener('click', () => {
    fileInput.click();
  });
  
  // File input change event
  fileInput.addEventListener('change', handleFileUpload);
  
  // Voice toggle change event
  if (voiceToggle) {
    voiceToggle.addEventListener('change', handleVoiceToggle);
  }
  
  console.log("Event listeners set up");
}

// Handle chat form submission
async function handleChatSubmit(event) {
  event.preventDefault();
  
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();
  
  if (message && !isProcessing) {
    // Clear input
    chatInput.value = '';
    
    // Add user message to chat
    addUserMessage(message);
    
    // Process message
    await processUserMessage(message);
  }
}

// Handle file upload
async function handleFileUpload(event) {
  const files = event.target.files;
  
  if (files.length > 0 && !isProcessing) {
    isProcessing = true;
    
    // Add system message
    addSystemMessage(`Processing file: ${files[0].name}`);
    
    try {
      // Process file
      // This would normally process the uploaded file
      // For now, we'll just simulate processing
      
      setTimeout(() => {
        addSystemMessage("File processed successfully. You can now ask questions about the data.");
        isProcessing = false;
      }, 2000);
    } catch (error) {
      console.error("Error processing file:", error);
      addSystemMessage("There was an error processing the file. Please try again.");
      isProcessing = false;
    }
  }
}

// Handle voice toggle
function handleVoiceToggle(event) {
  const isVoiceEnabled = event.target.checked;
  
  if (isVoiceEnabled) {
    addSystemMessage("Voice responses enabled.");
  } else {
    addSystemMessage("Voice responses disabled.");
  }
}

// Process user message
async function processUserMessage(message) {
  isProcessing = true;
  
  // Add typing indicator
  addTypingIndicator();
  
  try {
    // Prepare data for LLM
    const contextData = voiceDataIntegration ? voiceDataIntegration.formatDataForLLM() : null;
    
    // Detect agent mentions in the message
    const mentionedAgent = detectAgentMention(message);
    
    // Enhance context data with agent focus if an agent is mentioned
    const enhancedContextData = enhanceContextWithAgentFocus(contextData, mentionedAgent);
    
    // Call Gemini API
    const response = await callGeminiAPI(message, enhancedContextData);
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add AI response to chat
    addAIMessage(response);
    
    // Play voice response if enabled
    const voiceToggle = document.getElementById('voice-toggle');
    if (voiceToggle && voiceToggle.checked) {
      playVoiceResponse(response);
    }
    
    // Update visualizations if agent is mentioned
    if (mentionedAgent) {
      updateVisualizationsForAgent(mentionedAgent);
    }
  } catch (error) {
    console.error("Error processing message:", error);
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add error message
    addSystemMessage("There was an error processing your message. Please try again.");
  }
  
  isProcessing = false;
}

// Detect agent mention in message
function detectAgentMention(message) {
  const agents = ["Andrew", "Benjamin", "Evan"];
  const lowerMessage = message.toLowerCase();
  
  for (const agent of agents) {
    if (lowerMessage.includes(agent.toLowerCase())) {
      return agent;
    }
  }
  
  return null;
}

// Enhance context with agent focus
function enhanceContextWithAgentFocus(contextData, agent) {
  if (!contextData || !agent) {
    return contextData;
  }
  
  // Create a copy of the context data
  const enhancedData = JSON.parse(JSON.stringify(contextData));
  
  // Add agent focus flag
  enhancedData.agentFocus = agent;
  
  // Prioritize the focused agent's data
  if (enhancedData.agentPerformance[agent]) {
    enhancedData.focusedAgentData = enhancedData.agentPerformance[agent];
  }
  
  return enhancedData;
}

// Update visualizations for specific agent
function updateVisualizationsForAgent(agent) {
  if (voiceDataVisualization) {
    // Find the agent tab
    const agentTabs = document.querySelectorAll('.agent-tab');
    for (const tab of agentTabs) {
      if (tab.dataset.agent === agent) {
        // Simulate click on the agent tab
        tab.click();
        break;
      }
    }
  }
}

// Call Gemini API
async function callGeminiAPI(message, contextData) {
  try {
    // Import the Gemini API module
    const GeminiAPI = await import('./gemini-api.js');
    
    // Call the API
    return await GeminiAPI.default.generateContent(message, contextData);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Play voice response
async function playVoiceResponse(text) {
  try {
    // Import the ElevenLabs API module
    const ElevenLabsAPI = await import('./elevenlabs-api.js');
    
    // Call the API
    await ElevenLabsAPI.default.synthesizeSpeech(text);
  } catch (error) {
    console.error("Error playing voice response:", error);
    // Silently fail - don't disrupt the user experience
  }
}

// Add user message to chat
function addUserMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  
  const messageElement = document.createElement('div');
  messageElement.className = 'message user-message';
  messageElement.innerHTML = `
    <div class="message-content">
      <p>${message}</p>
    </div>
  `;
  
  chatMessages.appendChild(messageElement);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Add to messages array
  chatMessages.push({
    role: 'user',
    content: message
  });
}

// Add AI message to chat
function addAIMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  
  const messageElement = document.createElement('div');
  messageElement.className = 'message ai-message';
  messageElement.innerHTML = `
    <div class="message-avatar">
      <img src="assets/ai-avatar.png" alt="AI" onerror="this.src='https://via.placeholder.com/40'">
    </div>
    <div class="message-content">
      <p>${formatMessage(message)}</p>
    </div>
  `;
  
  chatMessages.appendChild(messageElement);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Add to messages array
  chatMessages.push({
    role: 'assistant',
    content: message
  });
}

// Add system message to chat
function addSystemMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  
  const messageElement = document.createElement('div');
  messageElement.className = 'message system-message';
  messageElement.innerHTML = `
    <div class="message-content">
      <p>${message}</p>
    </div>
  `;
  
  chatMessages.appendChild(messageElement);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
  const chatMessages = document.getElementById('chat-messages');
  
  const indicatorElement = document.createElement('div');
  indicatorElement.className = 'message ai-message typing-indicator';
  indicatorElement.innerHTML = `
    <div class="message-avatar">
      <img src="assets/ai-avatar.png" alt="AI" onerror="this.src='https://via.placeholder.com/40'">
    </div>
    <div class="message-content">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(indicatorElement);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const chatMessages = document.getElementById('chat-messages');
  const indicator = chatMessages.querySelector('.typing-indicator');
  
  if (indicator) {
    chatMessages.removeChild(indicator);
  }
}

// Format message (convert markdown to HTML)
function formatMessage(message) {
  // Simple markdown formatting
  // Bold
  message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Line breaks
  message = message.replace(/\n/g, '<br>');
  
  return message;
}

// Update UI to show data is loaded
function updateUIForDataLoaded() {
  const dataStatus = document.getElementById('data-status');
  
  if (dataStatus) {
    dataStatus.textContent = 'Voice Analysis Data Loaded';
    dataStatus.classList.add('data-loaded');
  }
  
  // Update visualization container
  const visualizationsContainer = document.getElementById('visualizations-container');
  
  if (visualizationsContainer) {
    visualizationsContainer.classList.add('data-loaded');
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);

// Export functions for testing
export {
  initialize,
  addUserMessage,
  addAIMessage,
  addSystemMessage,
  processUserMessage,
  detectAgentMention,
  enhanceContextWithAgentFocus
};
