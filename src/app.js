// Main application JavaScript for Dental AI Interface

// API Keys (these would normally be stored securely on the server)
// For demo purposes only - in production these should never be exposed in frontend code
const ELEVENLABS_API_KEY = ""; // Will be set via environment variables
const GEMINI_API_KEY = ""; // Will be set via environment variables

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const timePeriodSelect = document.getElementById('time-period');
const dataTypeSelect = document.getElementById('data-type');
const dataSourceItems = document.querySelectorAll('.data-source-item');
const voiceButton = document.querySelector('.control-button[data-tooltip="Voice Mode"]');
const clearButton = document.querySelector('.control-button[data-tooltip="Clear Chat"]');
const micButton = document.querySelector('.input-action[data-tooltip="Voice Input"]');
const attachButton = document.querySelector('.input-action[data-tooltip="Attach File"]');
const visualizationControls = document.querySelectorAll('.visualization-control');

// State
let isVoiceEnabled = true;
let isProcessing = false;
let currentDataSource = 'Customer Satisfaction Survey';
let activeVisualizationFilter = 'All';
let chatHistory = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    adjustTextareaHeight();
    
    // Simulate loading visualizations
    loadVisualizations();
});

// Set up event listeners
function initEventListeners() {
    // Send message on button click
    sendButton.addEventListener('click', handleSendMessage);
    
    // Send message on Enter key (but allow Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Auto-resize textarea as user types
    chatInput.addEventListener('input', adjustTextareaHeight);
    
    // Toggle voice mode
    voiceButton.addEventListener('click', toggleVoiceMode);
    
    // Clear chat history
    clearButton.addEventListener('click', clearChat);
    
    // Voice input
    micButton.addEventListener('click', startVoiceInput);
    
    // File attachment
    attachButton.addEventListener('click', handleAttachment);
    
    // Data source selection
    dataSourceItems.forEach(item => {
        item.addEventListener('click', () => {
            dataSourceItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentDataSource = item.querySelector('.data-source-name').textContent;
            // Could trigger a data reload here based on the selected source
        });
    });
    
    // Time period change
    timePeriodSelect.addEventListener('change', () => {
        // Could trigger a data reload here based on the selected time period
    });
    
    // Data type change
    dataTypeSelect.addEventListener('change', () => {
        // Could trigger a data reload here based on the selected data type
    });
    
    // Visualization filter controls
    visualizationControls.forEach(control => {
        control.addEventListener('click', () => {
            visualizationControls.forEach(c => c.classList.remove('active'));
            control.classList.add('active');
            activeVisualizationFilter = control.textContent;
            filterVisualizations(activeVisualizationFilter);
        });
    });
}

// Handle sending a message
async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (message === '' || isProcessing) return;
    
    isProcessing = true;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input
    chatInput.value = '';
    adjustTextareaHeight();
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Process with Gemini API
        const response = await processWithGemini(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response to chat
        addMessageToChat('ai', response);
        
        // Speak response if voice is enabled
        if (isVoiceEnabled) {
            speakWithElevenLabs(response);
        }
    } catch (error) {
        console.error('Error processing message:', error);
        removeTypingIndicator();
        addMessageToChat('ai', 'Sorry, I encountered an error processing your request. Please try again.');
    }
    
    isProcessing = false;
}

// Add a message to the chat interface
function addMessageToChat(sender, text) {
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
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to chat history
    chatHistory.push({
        role: sender === 'user' ? 'user' : 'assistant',
        content: text
    });
}

// Show typing indicator
function showTypingIndicator() {
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
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Process message with Gemini API
async function processWithGemini(message) {
    // This is a placeholder for the actual API call
    // In a real implementation, this would call the Gemini API
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, return a hardcoded response based on the message
    if (message.toLowerCase().includes('customer satisfaction')) {
        return "Based on the customer satisfaction data, we've seen a 15% increase in overall satisfaction scores in the last quarter. The highest rated aspects are staff friendliness (4.8/5) and cleanliness (4.7/5), while appointment wait times received the lowest scores (3.6/5). Would you like to see a detailed breakdown by service type?";
    } else if (message.toLowerCase().includes('agent performance')) {
        return "Looking at agent performance metrics, Dr. Sarah Johnson has the highest patient satisfaction rating at 4.9/5, with Dr. Michael Chen close behind at 4.8/5. The average appointment duration is 43 minutes, with Dr. Rodriguez being the most efficient at 38 minutes while maintaining a 4.7/5 satisfaction rating. Would you like more details on specific performance indicators?";
    } else if (message.toLowerCase().includes('visualization') || message.toLowerCase().includes('chart')) {
        return "I've analyzed the visualization data for you. The trend shows customer satisfaction has been steadily increasing over the past 6 months, with a notable 12% improvement in the 'treatment explanation' category. Agent performance visualizations indicate that morning appointments tend to receive higher satisfaction ratings than afternoon slots. Would you like me to explain any specific chart in more detail?";
    } else {
        return "I'm here to help you analyze dental practice data. You can ask me about customer satisfaction trends, agent performance metrics, or specific visualizations. What specific information would you like to know?";
    }
}

// Speak text using ElevenLabs API
async function speakWithElevenLabs(text) {
    // This is a placeholder for the actual API call
    // In a real implementation, this would call the ElevenLabs API
    console.log('Speaking with ElevenLabs:', text);
    
    // In a real implementation, we would:
    // 1. Call the ElevenLabs API to convert text to speech
    // 2. Play the returned audio
    
    // For demo purposes, we'll just show a voice animation
    const aiMessage = chatMessages.lastElementChild;
    if (aiMessage && aiMessage.classList.contains('ai')) {
        const content = aiMessage.querySelector('.message-content');
        
        const voiceAnimation = document.createElement('div');
        voiceAnimation.className = 'voice-animation';
        
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'voice-bar';
            voiceAnimation.appendChild(bar);
        }
        
        content.appendChild(voiceAnimation);
        
        // Remove animation after a few seconds
        setTimeout(() => {
            if (voiceAnimation.parentNode === content) {
                content.removeChild(voiceAnimation);
            }
        }, 5000);
    }
}

// Toggle voice mode
function toggleVoiceMode() {
    isVoiceEnabled = !isVoiceEnabled;
    voiceButton.classList.toggle('active', isVoiceEnabled);
}

// Clear chat history
function clearChat() {
    // Keep only the first welcome message
    while (chatMessages.children.length > 1) {
        chatMessages.removeChild(chatMessages.lastChild);
    }
    chatHistory = chatHistory.slice(0, 2); // Keep only the initial exchange
}

// Start voice input
function startVoiceInput() {
    // This is a placeholder for actual voice input functionality
    // In a real implementation, this would use the Web Speech API
    
    micButton.classList.add('active');
    
    // Simulate voice recognition
    setTimeout(() => {
        micButton.classList.remove('active');
        chatInput.value = "How is customer satisfaction trending this month?";
        adjustTextareaHeight();
    }, 2000);
}

// Handle file attachment
function handleAttachment() {
    // This is a placeholder for actual file attachment functionality
    // In a real implementation, this would open a file picker
    
    console.log('File attachment clicked');
    // Simulate file selection
    alert('File attachment functionality would be implemented here.');
}

// Auto-resize textarea as user types
function adjustTextareaHeight() {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
}

// Load visualizations
function loadVisualizations() {
    // This is a placeholder for actual visualization loading
    // In a real implementation, this would load and render charts
    
    console.log('Loading visualizations');
    // Visualizations are currently represented by placeholder images in the HTML
}

// Filter visualizations based on selected category
function filterVisualizations(filter) {
    console.log('Filtering visualizations by:', filter);
    // This would filter the visualization cards based on the selected category
    // For now, we're just logging the filter
}

// Initialize the application when the window loads
window.onload = function() {
    console.log('Dental AI Interface loaded');
};
