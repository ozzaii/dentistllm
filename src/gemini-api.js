// Gemini API Integration for Dental AI Interface

class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || 'AIzaSyARZyERqMaFInsbRKUA0NxOok77syBNzK8'; // Use provided key or default to the one from user
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    this.model = "models/gemini-2.0-flash"; // Correct model name with "models/" prefix
    this.chatHistory = [];
  }

  // Initialize the API with context about dental data
  async initialize() {
    // Add system prompt to provide context about available data
    this.chatHistory = [{
      parts: [{
        text: `You are an AI assistant for a dental practice. You have access to the following data:
        
        1. Customer satisfaction data including overall ratings, category breakdowns, trends, and comments
        2. Agent performance metrics for all dental staff including satisfaction ratings, appointment durations, and success rates
        3. Visualizations showing trends and comparisons across different metrics
        
        Your goal is to provide helpful insights about the dental practice based on this data. Be specific, professional, and concise.
        When discussing agent performance, focus on positive aspects while noting areas for improvement.
        When analyzing customer satisfaction, identify trends and suggest potential improvements.
        
        The data is current as of March 2025.`
      }]
    }];
    
    console.log("Gemini API initialized with dental context");
    return true;
  }

  // Process a user message and get a response
  async sendMessage(message, dataContext = null) {
    try {
      // Create a new request with the user's message
      const userMessage = {
        parts: [{
          text: message
        }]
      };
      
      // If we have specific data context, add it to the user message
      if (dataContext) {
        userMessage.parts.push({
          text: `Here is the relevant data for your reference:\n${JSON.stringify(dataContext, null, 2)}`
        });
      }
      
      // Prepare the request payload according to the correct format
      const payload = {
        contents: [userMessage]
      };
      
      // Make the actual API call to Gemini
      const response = await this.callGeminiAPI(payload);
      
      return response;
    } catch (error) {
      console.error("Error in Gemini API:", error);
      return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
  }
  
  // Make an actual API call to Gemini
  async callGeminiAPI(payload) {
    try {
      // Correct URL format with "models/" prefix
      const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
      
      console.log("Calling Gemini API at URL:", url);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error status:", response.status, response.statusText);
        console.error("Error response:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error("Parsed error data:", errorData);
        } catch (e) {
          // If parsing fails, we already logged the raw text
        }
        
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Gemini API response:", data);
      
      // Extract the response text from the API response
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0] && 
          data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected API response format:", data);
        return "I'm sorry, I received an unexpected response format. Please try again.";
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "I'm sorry, I couldn't connect to the AI service. Please check your internet connection and try again.";
    }
  }
  
  // Clear chat history
  clearHistory() {
    this.chatHistory = [];
    return true;
  }
}

// Export the class for use in the main application
export default GeminiAPI;
