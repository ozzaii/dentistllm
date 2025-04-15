// Gemini API Integration for Dental AI Interface

class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    this.model = "models/gemini-pro";
    this.chatHistory = [];
  }

  // Initialize the API with context about dental data
  async initialize() {
    // Add system prompt to provide context about available data
    this.chatHistory = [{
      role: "system",
      content: `You are an AI assistant for a dental practice. You have access to the following data:
      
      1. Customer satisfaction data including overall ratings, category breakdowns, trends, and comments
      2. Agent performance metrics for all dental staff including satisfaction ratings, appointment durations, and success rates
      3. Visualizations showing trends and comparisons across different metrics
      
      Your goal is to provide helpful insights about the dental practice based on this data. Be specific, professional, and concise.
      When discussing agent performance, focus on positive aspects while noting areas for improvement.
      When analyzing customer satisfaction, identify trends and suggest potential improvements.
      
      The data is current as of March 2025.`
    }];
    
    console.log("Gemini API initialized with dental context");
    return true;
  }

  // Process a user message and get a response
  async sendMessage(message, dataContext = null) {
    try {
      // Add user message to chat history
      this.chatHistory.push({
        role: "user",
        content: message
      });
      
      // If we have specific data context, add it to the prompt
      if (dataContext) {
        this.chatHistory.push({
          role: "system",
          content: `Here is the relevant data for your reference:\n${JSON.stringify(dataContext, null, 2)}`
        });
      }
      
      // Prepare the request payload
      const payload = {
        contents: this.chatHistory,
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };
      
      // In a real implementation, this would make an actual API call
      // For now, we'll simulate the API response
      const response = await this.simulateApiCall(message, payload);
      
      // Add assistant response to chat history
      this.chatHistory.push({
        role: "assistant",
        content: response
      });
      
      return response;
    } catch (error) {
      console.error("Error in Gemini API:", error);
      throw new Error("Failed to get response from Gemini API");
    }
  }
  
  // Simulate API call (in a real implementation, this would be an actual fetch to the Gemini API)
  async simulateApiCall(message, payload) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check message content and return appropriate response
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("customer satisfaction") || lowerMessage.includes("satisfaction rating")) {
      return this.generateCustomerSatisfactionResponse();
    } else if (lowerMessage.includes("agent performance") || lowerMessage.includes("dentist performance")) {
      return this.generateAgentPerformanceResponse();
    } else if (lowerMessage.includes("trend") || lowerMessage.includes("over time")) {
      return this.generateTrendAnalysisResponse();
    } else if (lowerMessage.includes("improvement") || lowerMessage.includes("suggestion")) {
      return this.generateImprovementSuggestionsResponse();
    } else if (lowerMessage.includes("visualization") || lowerMessage.includes("chart") || lowerMessage.includes("graph")) {
      return this.generateVisualizationDescriptionResponse();
    } else {
      return "I'm here to help you analyze dental practice data. You can ask me about customer satisfaction trends, agent performance metrics, or specific visualizations. What specific information would you like to know?";
    }
  }
  
  // Generate response about customer satisfaction
  generateCustomerSatisfactionResponse() {
    return "Based on the customer satisfaction data for March 2025, the overall rating is 4.2 out of 5 from 156 total responses. The highest rated categories are staff friendliness (4.8) and cleanliness (4.7), while the lowest rated areas are wait times (3.6) and value for money (3.9).\n\nThere's been a steady improvement in overall satisfaction from 3.9 in October 2024 to 4.2 in March 2025. Cosmetic procedures have the highest satisfaction (4.6), while root canals have the lowest (3.8).\n\nRecent comments suggest patients particularly appreciate Dr. Johnson's clear explanations and the new digital scanning technology. Areas for improvement include wait times, with several comments mentioning waits of 20-45 minutes past appointment times.";
  }
  
  // Generate response about agent performance
  generateAgentPerformanceResponse() {
    return "Looking at agent performance metrics for March 2025, Dr. Sarah Johnson has the highest patient satisfaction rating at 4.9/5, with Dr. Michael Chen close behind at 4.8/5. The average appointment duration across all 8 dentists is 43 minutes.\n\nDr. Elena Rodriguez is the most efficient, averaging 38 minutes per appointment while maintaining a 4.7/5 satisfaction rating. Dr. David Nguyen, as a new associate, has the longest average appointment time at 50 minutes.\n\nMorning appointments tend to have higher satisfaction ratings (4.7) compared to afternoon appointments (4.5). Cosmetic procedures have the highest satisfaction ratings (4.8) but also the longest average duration (65 minutes).\n\nThe overall treatment success rate is 97.2%, with Dr. Johnson leading at 99.1%.";
  }
  
  // Generate response about trends
  generateTrendAnalysisResponse() {
    return "Analyzing the trends in customer satisfaction, there's been a consistent upward trajectory over the past 6 months, from 3.9 in October 2024 to 4.2 in March 2025. This represents a 7.7% improvement overall.\n\nThe most significant improvements have been in the follow-up care category, which has seen steady growth. Wait times remain the lowest-rated aspect but have shown slight improvement from 3.4 to 3.6 over the same period.\n\nFor agent performance, morning appointments consistently outperform afternoon slots in terms of patient satisfaction, with a 0.2 point difference on average. This suggests scheduling high-priority or complex procedures in the morning could be beneficial.";
  }
  
  // Generate response about improvement suggestions
  generateImprovementSuggestionsResponse() {
    return "Based on the data analysis, here are some suggested improvements for the dental practice:\n\n1. Appointment Scheduling: The lowest satisfaction score is for wait times (3.6/5). Consider reviewing the scheduling system to reduce wait times, perhaps by adding buffer time between appointments or optimizing the booking process.\n\n2. Value Perception: The 'value for money' rating is relatively low at 3.9/5. Consider implementing a transparent pricing structure and explaining the value of treatments more clearly.\n\n3. Staff Training: While Dr. Sarah Johnson has excellent ratings (4.9/5), newer staff like Dr. David Nguyen (4.2/5) could benefit from mentoring to improve efficiency and patient satisfaction.\n\n4. Procedure Allocation: Since morning appointments have higher satisfaction ratings (4.7 vs 4.5 for afternoons), consider scheduling more complex procedures in the morning when possible.\n\n5. Patient Communication: Several comments mention appreciation for clear explanations. Standardizing how procedures are explained could improve overall satisfaction.";
  }
  
  // Generate response about visualizations
  generateVisualizationDescriptionResponse() {
    return "The visualizations show several key insights:\n\n1. The Customer Satisfaction Trend chart shows a steady increase from October 2024 (3.9) to March 2025 (4.2), with the steepest improvement occurring between October and December.\n\n2. The Agent Performance Comparison visualization highlights that Dr. Sarah Johnson and Dr. Michael Chen consistently outperform other dentists across all metrics, particularly in patient satisfaction and treatment success rate.\n\n3. The Service Quality Ratings chart shows that cosmetic procedures receive the highest satisfaction (4.6/5), followed by cleanings (4.5/5), while root canals have the lowest satisfaction (3.8/5) despite having a 95.8% success rate.\n\n4. The Time of Day Performance chart indicates that morning appointments (before noon) have approximately 4.4% higher satisfaction ratings than afternoon appointments.";
  }
  
  // Clear chat history except for the system prompt
  clearHistory() {
    const systemPrompt = this.chatHistory[0];
    this.chatHistory = [systemPrompt];
    return true;
  }
}

// Export the class for use in the main application
export default GeminiAPI;
