// Enhanced Gemini API integration with improved context preparation

class GeminiAPI {
  constructor() {
    this.apiKey = "AIzaSyARZyERqMaFInsbRKUA0NxOok77syBNzK8";
    this.model = "gemini-2.0-flash";
    this.baseUrl = "https://generativelanguage.googleapis.com/v1";
    console.log("Gemini API initialized with dental context");
  }

  // Generate content using Gemini API
  async generateContent(userMessage, contextData) {
    try {
      // Create a well-structured prompt with agent-specific information
      const prompt = this.createEnhancedPrompt(userMessage, contextData);
      
      // Call the API
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      // Check if the response is ok
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", response.status, response.statusText, errorData);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      // Parse the response
      const data = await response.json();
      
      // Extract the generated text
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected API response format:", data);
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  // Create an enhanced prompt with detailed agent-specific information
  createEnhancedPrompt(userMessage, voiceData) {
    // Start with a clear system instruction
    let prompt = `You are a dental AI assistant specializing in analyzing voice data from customer service calls at a dental clinic. You provide concise, helpful responses focused on the specific data available.

USER QUERY: ${userMessage}

`;

    // If we have voice data, add detailed context
    if (voiceData) {
      prompt += `AVAILABLE DATA CONTEXT:
======================

OVERVIEW:
The dental clinic has voice analysis data for ${voiceData.summaryStatistics.total_calls} total calls handled by 3 agents (Andrew, Benjamin, and Evan).

AGENT DETAILS:
`;

      // Add detailed information about each agent
      const agents = ["Andrew", "Benjamin", "Evan"];
      agents.forEach(agent => {
        if (voiceData.agentPerformance[agent]) {
          const perf = voiceData.agentPerformance[agent];
          prompt += `
- ${agent}: 
  * Handled ${perf.totalCalls} calls
  * Performance score: ${(perf.averagePerformance * 100).toFixed(1)}%
  * Top emotions detected: ${perf.topEmotions.join(', ')}
  * Most discussed topics: ${perf.topTopics.join(', ')}
  * Risk factors identified: ${perf.riskFactors.join(', ')}
`;
        }
      });

      // Add overall performance metrics
      prompt += `
OVERALL PERFORMANCE:
- Top performing agent: ${voiceData.overallPerformance.topPerformingAgent}
- Average performance across all agents: ${(voiceData.overallPerformance.averagePerformance * 100).toFixed(1)}%
- Most common emotions detected: ${voiceData.overallPerformance.topEmotions.join(', ')}
- Most discussed topics across all calls: ${voiceData.overallPerformance.topTopics.join(', ')}
- Common risk factors: ${voiceData.overallPerformance.commonRiskFactors.join(', ')}

`;

      // Add specific instructions for response format
      prompt += `RESPONSE INSTRUCTIONS:
1. Be concise and direct in your answers
2. When discussing a specific agent, clearly reference their name and relevant metrics
3. If comparing agents, use specific data points from their performance metrics
4. If the user asks about an agent or metric not in the data, clearly state that information is not available
5. Focus only on the data provided - don't make assumptions beyond what's in the context
6. Keep responses under 150 words unless detailed analysis is specifically requested

Now, please respond to the user's query based on this voice analysis data.`;
    } else {
      // If no data is available, provide a clear response about limitations
      prompt += `NOTE: No voice analysis data is currently available. I can only provide general information about dental practices and customer service. If you have specific questions about agent performance or customer satisfaction, please upload voice analysis data first.`;
    }

    return prompt;
  }
}

export default new GeminiAPI();
