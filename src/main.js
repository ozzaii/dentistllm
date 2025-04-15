// Main application integration file
// This file connects all components and initializes the application

// Import modules
import GeminiAPI from './gemini-api.js';
import ElevenLabsAPI from './elevenlabs-api.js';
import DataVisualizer from './data-visualizer.js';
import AgentPerformanceAnalytics from './agent-performance-analytics.js';
import CustomerSatisfactionAnalytics from './customer-satisfaction-analytics.js';

// Application class
class DentalAIApp {
  constructor() {
    // API instances
    this.geminiAPI = null;
    this.elevenLabsAPI = null;
    
    // Analytics instances
    this.dataVisualizer = null;
    this.agentAnalytics = null;
    this.satisfactionAnalytics = null;
    
    // DOM elements
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.sendButton = document.getElementById('send-button');
    this.voiceButton = document.querySelector('.control-button[data-tooltip="Voice Mode"]');
    this.clearButton = document.querySelector('.control-button[data-tooltip="Clear Chat"]');
    
    // State
    this.isVoiceEnabled = true;
    this.isProcessing = false;
  }
  
  // Initialize the application
  async initialize() {
    try {
      console.log('Initializing Dental AI Application...');
      
      // Initialize APIs with API keys
      // In a production environment, these would be securely stored
      // For demo purposes, we're using empty strings
      const geminiApiKey = ''; // Would be set via secure environment variables in production
      const elevenLabsApiKey = ''; // Would be set via secure environment variables in production
      
      this.geminiAPI = new GeminiAPI(geminiApiKey);
      await this.geminiAPI.initialize();
      
      this.elevenLabsAPI = new ElevenLabsAPI(elevenLabsApiKey);
      this.elevenLabsAPI.initialize();
      
      // Initialize analytics components
      this.dataVisualizer = new DataVisualizer('visualization-container');
      await this.dataVisualizer.initialize();
      await this.dataVisualizer.loadData();
      
      this.agentAnalytics = new AgentPerformanceAnalytics();
      await this.agentAnalytics.initialize();
      
      this.satisfactionAnalytics = new CustomerSatisfactionAnalytics();
      await this.satisfactionAnalytics.initialize();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Create visualizations
      this.dataVisualizer.createVisualizations();
      
      console.log('Dental AI Application initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing application:', error);
      return false;
    }
  }
  
  // Set up event listeners
  setupEventListeners() {
    // Send message on button click
    this.sendButton.addEventListener('click', () => this.handleSendMessage());
    
    // Send message on Enter key (but allow Shift+Enter for new line)
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });
    
    // Auto-resize textarea as user types
    this.chatInput.addEventListener('input', () => this.adjustTextareaHeight());
    
    // Toggle voice mode
    this.voiceButton.addEventListener('click', () => this.toggleVoiceMode());
    
    // Clear chat history
    this.clearButton.addEventListener('click', () => this.clearChat());
    
    // Visualization filter controls
    const visualizationControls = document.querySelectorAll('.visualization-control');
    visualizationControls.forEach(control => {
      control.addEventListener('click', () => {
        visualizationControls.forEach(c => c.classList.remove('active'));
        control.classList.add('active');
        const filter = control.textContent;
        this.dataVisualizer.updateVisualizations(filter);
      });
    });
    
    // Data source selection
    const dataSourceItems = document.querySelectorAll('.data-source-item');
    dataSourceItems.forEach(item => {
      item.addEventListener('click', () => {
        dataSourceItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        // Could trigger data reload here
      });
    });
  }
  
  // Handle sending a message
  async handleSendMessage() {
    const message = this.chatInput.value.trim();
    if (message === '' || this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Add user message to chat
    this.addMessageToChat('user', message);
    
    // Clear input
    this.chatInput.value = '';
    this.adjustTextareaHeight();
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Determine context based on message content
      const context = this.determineContext(message);
      
      // Process with Gemini API
      const response = await this.geminiAPI.sendMessage(message, context);
      
      // Remove typing indicator
      this.removeTypingIndicator();
      
      // Add AI response to chat
      this.addMessageToChat('ai', response);
      
      // Speak response if voice is enabled
      if (this.isVoiceEnabled) {
        this.elevenLabsAPI.speak(response);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      this.removeTypingIndicator();
      this.addMessageToChat('ai', 'Sorry, I encountered an error processing your request. Please try again.');
    }
    
    this.isProcessing = false;
  }
  
  // Determine which context data to provide based on message content
  determineContext(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('customer satisfaction') || 
        lowerMessage.includes('patient feedback') || 
        lowerMessage.includes('satisfaction rating')) {
      return this.satisfactionAnalytics.metrics;
    } 
    else if (lowerMessage.includes('agent performance') || 
             lowerMessage.includes('dentist performance') || 
             lowerMessage.includes('staff performance')) {
      return this.agentAnalytics.metrics;
    }
    else if (lowerMessage.includes('visualization') || 
             lowerMessage.includes('chart') || 
             lowerMessage.includes('graph')) {
      return {
        visualizations: 'available',
        types: ['satisfaction trend', 'agent performance', 'service quality', 'time of day performance']
      };
    }
    else if (lowerMessage.includes('recommendation') || 
             lowerMessage.includes('suggestion') || 
             lowerMessage.includes('improve')) {
      return {
        agentRecommendations: this.agentAnalytics.generateRecommendations(),
        satisfactionRecommendations: this.satisfactionAnalytics.generateRecommendations()
      };
    }
    else if (lowerMessage.includes('insight') || 
             lowerMessage.includes('analysis') || 
             lowerMessage.includes('overview')) {
      return {
        agentInsights: this.agentAnalytics.generateInsights(),
        satisfactionInsights: this.satisfactionAnalytics.generateInsights()
      };
    }
    
    // Default: provide basic context
    return {
      overallSatisfaction: this.satisfactionAnalytics.getOverallSummary(),
      topPerformers: this.agentAnalytics.calculateTopPerformers(2)
    };
  }
  
  // Add a message to the chat interface
  addMessageToChat(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender} fade-in`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}`;
    
    const icon = document.createElement('i');
    icon.className = sender === 'ai' ? 'ri-robot-line' : 'ri-user-line';
    avatar.appendChild(icon);
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = text;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = 'Just now';
    
    content.appendChild(messageText);
    content.appendChild(messageTime);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    this.chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  // Show typing indicator
  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai fade-in';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar ai';
    
    const icon = document.createElement('i');
    icon.className = 'ri-robot-line';
    avatar.appendChild(icon);
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const loading = document.createElement('div');
    loading.className = 'loading';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'loading-dot';
      loading.appendChild(dot);
    }
    
    content.appendChild(loading);
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    
    this.chatMessages.appendChild(typingDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  // Remove typing indicator
  removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // Toggle voice mode
  toggleVoiceMode() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    this.voiceButton.classList.toggle('active', this.isVoiceEnabled);
    this.elevenLabsAPI.setEnabled(this.isVoiceEnabled);
  }
  
  // Clear chat history
  clearChat() {
    // Keep only the first welcome message
    while (this.chatMessages.children.length > 1) {
      this.chatMessages.removeChild(this.chatMessages.lastChild);
    }
    
    // Clear API chat history
    this.geminiAPI.clearHistory();
  }
  
  // Auto-resize textarea as user types
  adjustTextareaHeight() {
    this.chatInput.style.height = 'auto';
    this.chatInput.style.height = (this.chatInput.scrollHeight) + 'px';
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new DentalAIApp();
  app.initialize();
});

// Export the app class
export default DentalAIApp;
