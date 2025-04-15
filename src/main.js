// Main JavaScript file for Dental AI Interface

// Import required modules
import GeminiAPI from './gemini-api.js';
import ElevenLabsAPI from './elevenlabs-api.js';
import DataVisualizer from './data-visualizer.js';
import AgentPerformanceAnalytics from './agent-performance-analytics.js';
import CustomerSatisfactionAnalytics from './customer-satisfaction-analytics.js';
import DataIntegration from './data-integration.js';

// Main application class
class DentalAIApp {
  constructor() {
    // Initialize APIs and components
    this.geminiAPI = new GeminiAPI();
    this.elevenLabsAPI = new ElevenLabsAPI();
    this.dataVisualizer = new DataVisualizer();
    this.agentPerformanceAnalytics = new AgentPerformanceAnalytics();
    this.customerSatisfactionAnalytics = new CustomerSatisfactionAnalytics();
    this.dataIntegration = new DataIntegration();
    
    // UI elements
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.sendButton = document.getElementById('send-button');
    this.visualizationContainer = document.getElementById('visualization-container');
    
    // State
    this.isProcessing = false;
    this.voiceEnabled = true;
  }

  // Initialize the application
  async initialize() {
    console.log("Initializing Dental AI Application...");
    
    try {
      // Initialize APIs
      await this.geminiAPI.initialize();
      await this.elevenLabsAPI.initialize();
      
      // Initialize data components
      await this.dataVisualizer.initialize();
      await this.agentPerformanceAnalytics.initialize();
      await this.customerSatisfactionAnalytics.initialize();
      await this.dataIntegration.initialize();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Send initial welcome message
      this.addAIMessage("I'm here to help you analyze dental practice data. You can ask me about customer satisfaction trends, agent performance metrics, or specific visualizations. What specific information would you like to know?");
      
      console.log("Dental AI Application initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing application:", error);
      return false;
    }
  }

  // Set up event listeners
  setupEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', () => {
      this.handleUserMessage();
    });
    
    // Enter key press in input
    this.chatInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.handleUserMessage();
      }
    });
    
    // Auto-resize input as user types
    this.chatInput.addEventListener('input', () => {
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = (this.chatInput.scrollHeight) + 'px';
    });
    
    // Voice mode toggle
    const voiceButton = document.querySelector('.control-button[data-tooltip="Voice Mode"]');
    if (voiceButton) {
      voiceButton.addEventListener('click', () => {
        this.voiceEnabled = !this.voiceEnabled;
        voiceButton.classList.toggle('active', this.voiceEnabled);
      });
    }
    
    // Clear chat button
    const clearButton = document.querySelector('.control-button[data-tooltip="Clear Chat"]');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearChat();
      });
    }
    
    // Visualization filter buttons
    const visualizationControls = document.querySelectorAll('.visualization-control');
    visualizationControls.forEach(control => {
      control.addEventListener('click', () => {
        visualizationControls.forEach(c => c.classList.remove('active'));
        control.classList.add('active');
        this.filterVisualizations(control.textContent.toLowerCase());
      });
    });
    
    // File upload button
    const attachButton = document.querySelector('.input-action[data-tooltip="Attach File"]');
    if (attachButton) {
      attachButton.addEventListener('click', () => {
        this.handleFileUpload();
      });
    }
  }

  // Handle user message submission
  async handleUserMessage() {
    const message = this.chatInput.value.trim();
    if (!message || this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Add user message to chat
    this.addUserMessage(message);
    
    // Clear input
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';
    
    try {
      // Get relevant data context based on message
      const dataContext = this.getRelevantDataContext(message);
      
      // Get response from Gemini API
      const response = await this.geminiAPI.sendMessage(message, dataContext);
      
      // Add AI response to chat
      this.addAIMessage(response);
      
      // Speak response if voice is enabled
      if (this.voiceEnabled) {
        await this.elevenLabsAPI.speakText(response);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      this.addAIMessage("I'm sorry, I encountered an error while processing your request. Please try again.");
    } finally {
      this.isProcessing = false;
    }
  }

  // Add user message to chat
  addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user fade-in';
    messageElement.innerHTML = `
      <div class="message-avatar user">
        <i class="ri-user-line"></i>
      </div>
      <div class="message-content">
        <div class="message-text">${this.escapeHTML(message)}</div>
        <div class="message-time">Just now</div>
      </div>
    `;
    
    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();
  }

  // Add AI message to chat
  addAIMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message ai fade-in';
    messageElement.innerHTML = `
      <div class="message-avatar ai">
        <i class="ri-robot-line"></i>
      </div>
      <div class="message-content">
        <div class="message-text">${this.escapeHTML(message)}</div>
        <div class="message-time">Just now</div>
      </div>
    `;
    
    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();
  }

  // Scroll chat to bottom
  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  // Clear chat messages
  clearChat() {
    // Keep only the first welcome message
    const firstMessage = this.chatMessages.querySelector('.message');
    this.chatMessages.innerHTML = '';
    if (firstMessage) {
      this.chatMessages.appendChild(firstMessage);
    }
  }

  // Filter visualizations based on category
  filterVisualizations(category) {
    const cards = document.querySelectorAll('.visualization-card');
    
    if (category === 'all') {
      cards.forEach(card => card.style.display = 'flex');
      return;
    }
    
    cards.forEach(card => {
      const name = card.querySelector('.visualization-name').textContent.toLowerCase();
      const description = card.querySelector('.visualization-description').textContent.toLowerCase();
      
      if (name.includes(category) || description.includes(category)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Get relevant data context based on user message
  getRelevantDataContext(message) {
    // Check if we have processed data from the data integration system
    const integratedData = this.dataIntegration.getProcessedDataForLLM();
    if (integratedData) {
      return integratedData;
    }
    
    // If no integrated data, use analytics data
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('satisfaction') || messageLower.includes('customer') || messageLower.includes('patient')) {
      return this.customerSatisfactionAnalytics.getData();
    } else if (messageLower.includes('agent') || messageLower.includes('performance') || messageLower.includes('staff')) {
      return this.agentPerformanceAnalytics.getData();
    } else {
      // Combine both datasets for general queries
      return {
        customerSatisfaction: this.customerSatisfactionAnalytics.getData(),
        agentPerformance: this.agentPerformanceAnalytics.getData()
      };
    }
  }

  // Handle file upload for data integration
  handleFileUpload() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.json,.csv,.xlsx';
    
    // Handle file selection
    fileInput.addEventListener('change', async (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      this.addAIMessage(`I'm processing ${files.length} file(s). This may take a moment...`);
      
      // Process each file
      for (const file of files) {
        // Determine file type based on extension
        let type = 'unknown';
        if (file.name.includes('satisfaction') || file.name.includes('customer')) {
          type = 'customer-satisfaction';
        } else if (file.name.includes('agent') || file.name.includes('performance')) {
          type = 'agent-performance';
        } else if (file.name.includes('visual') || file.name.includes('chart')) {
          type = 'visualization';
        }
        
        // Add file to data integration system
        this.dataIntegration.addDataFile(file, type);
      }
      
      // Process all files
      const success = await this.dataIntegration.processDataFiles();
      
      if (success) {
        this.addAIMessage(`I've successfully processed ${files.length} file(s). You can now ask me questions about this data.`);
        
        // Update visualizations if needed
        const visualizationData = this.dataIntegration.getVisualizationData();
        if (visualizationData && visualizationData.length > 0) {
          this.updateVisualizations(visualizationData);
        }
      } else {
        this.addAIMessage("I encountered an error while processing the files. Please try again or upload different files.");
      }
    });
    
    // Trigger file selection dialog
    fileInput.click();
  }

  // Update visualizations with new data
  updateVisualizations(visualizationData) {
    // This would normally update the visualization components
    console.log("Updating visualizations with new data:", visualizationData);
  }

  // Escape HTML to prevent XSS
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new DentalAIApp();
  await app.initialize();
});
