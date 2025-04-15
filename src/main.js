// Main JavaScript file for Dental AI Interface

// Import required modules
import GeminiAPI from './gemini-api.js';
import ElevenLabsAPI from './elevenlabs-api.js';
import DataVisualizer from './data-visualizer.js';
import AgentPerformanceAnalytics from './agent-performance-analytics.js';
import CustomerSatisfactionAnalytics from './customer-satisfaction-analytics.js';
import DataIntegration from './data-integration.js';
import FileProcessor from './file-processor.js';

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
    this.fileProcessor = new FileProcessor();
    
    // UI elements
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.sendButton = document.getElementById('send-button');
    this.visualizationContainer = document.getElementById('visualization-container');
    
    // State
    this.isProcessing = false;
    this.voiceEnabled = true;
    this.processingFiles = false;
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
      await this.fileProcessor.initialize();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Create file upload overlay
      this.createFileUploadOverlay();
      
      // Create processing overlay
      this.createProcessingOverlay();
      
      // Send initial welcome message
      this.addAIMessage("I'm here to help you analyze dental practice data. You can ask me about customer satisfaction trends, agent performance metrics, or upload data files for analysis. What would you like to know?");
      
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
        this.showFileUploadOverlay();
      });
    }
  }

  // Create file upload overlay
  createFileUploadOverlay() {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'file-upload-overlay';
    overlay.id = 'file-upload-overlay';
    
    // Create container
    const container = document.createElement('div');
    container.className = 'file-upload-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'file-upload-header';
    header.innerHTML = `
      <h2 class="file-upload-title">Upload Data Files</h2>
      <button class="file-upload-close" id="file-upload-close">&times;</button>
    `;
    
    // Create dropzone
    const dropzone = document.createElement('div');
    dropzone.className = 'file-upload-dropzone';
    dropzone.id = 'file-upload-dropzone';
    dropzone.innerHTML = `
      <i class="ri-upload-cloud-2-line file-upload-icon"></i>
      <p class="file-upload-text">Drag and drop files here</p>
      <p class="file-upload-subtext">or</p>
      <input type="file" class="file-upload-input" id="file-upload-input" multiple>
      <button class="file-upload-button" id="file-upload-button">Browse Files</button>
    `;
    
    // Create file list
    const fileList = document.createElement('div');
    fileList.className = 'file-list';
    fileList.id = 'file-list';
    
    // Create actions
    const actions = document.createElement('div');
    actions.className = 'file-upload-actions';
    actions.innerHTML = `
      <button class="file-upload-cancel" id="file-upload-cancel">Cancel</button>
      <button class="file-upload-submit" id="file-upload-submit">Upload Files</button>
    `;
    
    // Assemble container
    container.appendChild(header);
    container.appendChild(dropzone);
    container.appendChild(fileList);
    container.appendChild(actions);
    
    // Add container to overlay
    overlay.appendChild(container);
    
    // Add overlay to body
    document.body.appendChild(overlay);
    
    // Set up event listeners
    this.setupFileUploadListeners();
  }

  // Set up file upload listeners
  setupFileUploadListeners() {
    // Close button
    const closeButton = document.getElementById('file-upload-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hideFileUploadOverlay();
      });
    }
    
    // Cancel button
    const cancelButton = document.getElementById('file-upload-cancel');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.hideFileUploadOverlay();
      });
    }
    
    // Browse button
    const browseButton = document.getElementById('file-upload-button');
    const fileInput = document.getElementById('file-upload-input');
    if (browseButton && fileInput) {
      browseButton.addEventListener('click', () => {
        fileInput.click();
      });
    }
    
    // File input change
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        this.handleFileSelection(event.target.files);
      });
    }
    
    // Dropzone
    const dropzone = document.getElementById('file-upload-dropzone');
    if (dropzone) {
      // Prevent default drag behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
      });
      
      // Highlight dropzone when dragging over it
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.add('dragover');
        }, false);
      });
      
      // Remove highlight when dragging leaves
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.remove('dragover');
        }, false);
      });
      
      // Handle dropped files
      dropzone.addEventListener('drop', (event) => {
        const files = event.dataTransfer.files;
        this.handleFileSelection(files);
      }, false);
    }
    
    // Submit button
    const submitButton = document.getElementById('file-upload-submit');
    if (submitButton) {
      submitButton.addEventListener('click', () => {
        this.processSelectedFiles();
      });
    }
    
    // Prevent defaults for drag events
    function preventDefaults(event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // Show file upload overlay
  showFileUploadOverlay() {
    const overlay = document.getElementById('file-upload-overlay');
    if (overlay) {
      overlay.classList.add('active');
    }
  }

  // Hide file upload overlay
  hideFileUploadOverlay() {
    const overlay = document.getElementById('file-upload-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      
      // Clear file list
      const fileList = document.getElementById('file-list');
      if (fileList) {
        fileList.innerHTML = '';
      }
      
      // Reset file input
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  // Handle file selection
  handleFileSelection(files) {
    if (!files || files.length === 0) return;
    
    const fileList = document.getElementById('file-list');
    if (!fileList) return;
    
    // Clear existing list
    fileList.innerHTML = '';
    
    // Add each file to the list
    Array.from(files).forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      
      // Determine icon based on file type
      let iconClass = 'ri-file-line';
      if (file.type.startsWith('image/')) {
        iconClass = 'ri-image-line';
      } else if (file.name.endsWith('.json')) {
        iconClass = 'ri-file-code-line';
      } else if (file.name.endsWith('.csv')) {
        iconClass = 'ri-file-excel-line';
      } else if (file.name.endsWith('.zip')) {
        iconClass = 'ri-file-zip-line';
      }
      
      // Format file size
      const fileSize = this.formatFileSize(file.size);
      
      fileItem.innerHTML = `
        <div class="file-item-info">
          <i class="${iconClass} file-item-icon"></i>
          <div>
            <div class="file-item-name">${file.name}</div>
            <div class="file-item-size">${fileSize}</div>
          </div>
        </div>
        <button class="file-item-remove" data-filename="${file.name}">
          <i class="ri-close-line"></i>
        </button>
      `;
      
      fileList.appendChild(fileItem);
      
      // Add file to processor
      this.fileProcessor.addFile(file);
    });
    
    // Set up remove buttons
    const removeButtons = document.querySelectorAll('.file-item-remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const filename = event.currentTarget.getAttribute('data-filename');
        this.removeFile(filename);
      });
    });
  }

  // Remove file from list
  removeFile(filename) {
    // Remove from UI
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
      const itemName = item.querySelector('.file-item-name').textContent;
      if (itemName === filename) {
        item.remove();
      }
    });
    
    // Remove from processor
    // Note: This is a simplified version, as the current FileProcessor doesn't have a direct method to remove a single file
    // In a real implementation, we would add a removeFile method to the FileProcessor class
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Process selected files
  async processSelectedFiles() {
    // Hide file upload overlay
    this.hideFileUploadOverlay();
    
    // Show processing overlay
    this.showProcessingOverlay();
    
    // Set processing state
    this.processingFiles = true;
    
    try {
      // Process files
      const success = await this.fileProcessor.processFiles();
      
      // Hide processing overlay
      this.hideProcessingOverlay();
      
      if (success) {
        // Get processed files
        const processedFiles = this.fileProcessor.getProcessedFiles();
        
        // Add message to chat
        this.addAIMessage(`I've successfully processed ${processedFiles.length} file(s). You can now ask me questions about this data.`);
        
        // If there are zip contents, add additional message
        const zipContents = this.fileProcessor.getZipContents();
        if (zipContents.length > 0) {
          this.addAIMessage(`I've extracted ${zipContents.length} files from the uploaded zip file(s). All files have been processed and are ready for analysis.`);
        }
      } else {
        this.addAIMessage("I encountered an error while processing the files. Please try again or upload different files.");
      }
    } catch (error) {
      console.error("Error processing files:", error);
      this.addAIMessage("I encountered an error while processing the files. Please try again or upload different files.");
      
      // Hide processing overlay
      this.hideProcessingOverlay();
    } finally {
      // Reset processing state
      this.processingFiles = false;
    }
  }

  // Create processing overlay
  createProcessingOverlay() {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'processing-overlay';
    overlay.id = 'processing-overlay';
    
    // Create container
    const container = document.createElement('div');
    container.className = 'processing-container';
    
    // Create content
    container.innerHTML = `
      <i class="ri-loader-4-line processing-icon"></i>
      <h2 class="processing-title">Processing Files</h2>
      <p class="processing-text">Please wait while I process your files. This may take a moment...</p>
      <div class="processing-progress">
        <div class="processing-progress-bar" id="processing-progress-bar"></div>
      </div>
      <div class="processing-status" id="processing-status">Initializing...</div>
    `;
    
    // Add container to overlay
    overlay.appendChild(container);
    
    // Add overlay to body
    document.body.appendChild(overlay);
  }

  // Show processing overlay
  showProcessingOverlay() {
    const overlay = document.getElementById('processing-overlay');
    if (overlay) {
      overlay.classList.add('active');
      
      // Animate progress bar
      const progressBar = document.getElementById('processing-progress-bar');
      if (progressBar) {
        progressBar.style.width = '0%';
        setTimeout(() => {
          progressBar.style.width = '30%';
          
          setTimeout(() => {
            progressBar.style.width = '60%';
            
            setTimeout(() => {
              progressBar.style.width = '90%';
            }, 1500);
          }, 1000);
        }, 500);
      }
      
      // Update status text
      const statusText = document.getElementById('processing-status');
      if (statusText) {
        setTimeout(() => {
          statusText.textContent = 'Reading files...';
          
          setTimeout(() => {
            statusText.textContent = 'Extracting data...';
            
            setTimeout(() => {
              statusText.textContent = 'Analyzing content...';
              
              setTimeout(() => {
                statusText.textContent = 'Finalizing...';
              }, 1500);
            }, 1000);
          }, 1000);
        }, 500);
      }
    }
  }

  // Hide processing overlay
  hideProcessingOverlay() {
    const overlay = document.getElementById('processing-overlay');
    if (overlay) {
      // Complete progress bar
      const progressBar = document.getElementById('processing-progress-bar');
      if (progressBar) {
        progressBar.style.width = '100%';
      }
      
      // Update status text
      const statusText = document.getElementById('processing-status');
      if (statusText) {
        statusText.textContent = 'Complete!';
      }
      
      // Hide overlay after a short delay
      setTimeout(() => {
        overlay.classList.remove('active');
      }, 500);
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
        <div class="message-text">${this.formatAIMessage(message)}</div>
        <div class="message-time">Just now</div>
      </div>
    `;
    
    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();
  }

  // Format AI message with markdown-like syntax
  formatAIMessage(message) {
    // Escape HTML first
    let formattedMessage = this.escapeHTML(message);
    
    // Replace markdown-like syntax with HTML
    
    // Headers
    formattedMessage = formattedMessage.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    formattedMessage = formattedMessage.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    formattedMessage = formattedMessage.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    
    // Bold
    formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists
    formattedMessage = formattedMessage.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    formattedMessage = formattedMessage.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    
    // Wrap lists in ul/ol tags
    formattedMessage = formattedMessage.replace(/(<li>.*?<\/li>)\n(?!<li>)/gs, '<ul>$1</ul>\n');
    
    // Line breaks
    formattedMessage = formattedMessage.replace(/\n/g, '<br>');
    
    return formattedMessage;
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
    // Check if we have processed files from the file processor
    const processedFiles = this.fileProcessor.getProcessedFiles();
    if (processedFiles && processedFiles.length > 0) {
      return this.fileProcessor.formatFilesForLLM();
    }
    
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
