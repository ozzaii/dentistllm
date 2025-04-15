// Enhanced Gemini API Integration for Dental AI Interface with data file prompting

class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || 'AIzaSyARZyERqMaFInsbRKUA0NxOok77syBNzK8'; // Use provided key or default to the one from user
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    this.model = "models/gemini-2.0-flash"; // Correct model name with "models/" prefix
    this.systemPrompt = this.generateSystemPrompt();
  }

  // Initialize the API with context about dental data
  async initialize() {
    console.log("Gemini API initialized with dental context");
    return true;
  }

  // Generate the system prompt for dental context
  generateSystemPrompt() {
    return `You are an AI assistant specialized in analyzing dental practice data. 
You have access to data about customer satisfaction, agent performance, and other dental practice metrics.
When analyzing data:
1. Provide clear, concise insights based on the data
2. Highlight important trends and patterns
3. Suggest actionable recommendations for improvement
4. Use professional dental terminology appropriately
5. Be honest about limitations in the data
6. Format your responses in a structured, easy-to-read manner

The data you're analyzing comes from a dental practice management system and includes:
- Customer satisfaction surveys and ratings
- Dental agent/staff performance metrics
- Appointment and treatment data
- Patient feedback and comments

Respond in a professional, helpful manner appropriate for dental practice management.`;
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
      
      // Create the system message with the system prompt
      const systemMessage = {
        parts: [{
          text: this.systemPrompt
        }]
      };
      
      // If we have specific data context, enhance the system prompt with data context
      if (dataContext) {
        // Create an enhanced system prompt with data context
        const enhancedSystemPrompt = this.createEnhancedPromptWithData(dataContext);
        systemMessage.parts[0].text = enhancedSystemPrompt;
      }
      
      // Prepare the request payload according to the correct format
      const payload = {
        contents: [systemMessage, userMessage],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };
      
      // Make the actual API call to Gemini
      const response = await this.callGeminiAPI(payload);
      
      return response;
    } catch (error) {
      console.error("Error in Gemini API:", error);
      return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
  }
  
  // Create an enhanced prompt with data context
  createEnhancedPromptWithData(dataContext) {
    // Start with the base system prompt
    let enhancedPrompt = this.systemPrompt;
    
    // Add information about the data files
    enhancedPrompt += "\n\n--- DATA CONTEXT ---\n\n";
    
    // Check if we have processed files
    if (dataContext.files && dataContext.files.length > 0) {
      enhancedPrompt += `You have access to ${dataContext.files.length} data files:\n`;
      
      // Add information about each file
      dataContext.files.forEach((file, index) => {
        enhancedPrompt += `\n${index + 1}. File: ${file.name} (${file.type})\n`;
        
        // Add file content based on type
        if (file.type === 'json' && file.data) {
          enhancedPrompt += `Content: ${JSON.stringify(file.data, null, 2)}\n`;
        } else if (file.type === 'csv' && file.data) {
          enhancedPrompt += `Headers: ${file.data.headers.join(', ')}\n`;
          enhancedPrompt += `Data: ${JSON.stringify(file.data.data, null, 2)}\n`;
        } else if (file.type === 'text' && file.content) {
          enhancedPrompt += `Content: ${file.content}\n`;
        } else if (file.type === 'image') {
          enhancedPrompt += `${file.description}\n`;
        }
      });
      
      // Add metadata
      if (dataContext.metadata) {
        enhancedPrompt += `\nMetadata: ${JSON.stringify(dataContext.metadata, null, 2)}\n`;
      }
    } else if (dataContext.customerSatisfaction || dataContext.agentPerformance) {
      // Handle legacy data format
      if (dataContext.customerSatisfaction) {
        enhancedPrompt += "Customer Satisfaction Data:\n";
        enhancedPrompt += `${JSON.stringify(dataContext.customerSatisfaction, null, 2)}\n\n`;
      }
      
      if (dataContext.agentPerformance) {
        enhancedPrompt += "Agent Performance Data:\n";
        enhancedPrompt += `${JSON.stringify(dataContext.agentPerformance, null, 2)}\n\n`;
      }
    }
    
    // Add instructions for analyzing the data
    enhancedPrompt += `\n--- ANALYSIS INSTRUCTIONS ---\n
1. Carefully analyze the provided data files
2. Focus on the specific aspects mentioned in the user's query
3. Provide data-driven insights and recommendations
4. Use specific numbers and metrics from the data to support your analysis
5. Highlight any limitations or gaps in the data
6. Format your response in a clear, structured manner with headings and bullet points where appropriate\n`;
    
    return enhancedPrompt;
  }
  
  // Make a direct API call to Gemini
  async callGeminiAPI(payload) {
    try {
      // Correct URL format with "models/" prefix
      const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
      
      console.log("Calling Gemini API at URL:", url);
      
      // Use the fetch API with mode: 'cors' to explicitly enable CORS
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors', // Explicitly enable CORS
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
    return true;
  }
}

// Export the class for use in the main application
export default GeminiAPI;
