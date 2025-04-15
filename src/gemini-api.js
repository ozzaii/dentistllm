// Enhanced Gemini API integration with improved context preparation and Turkish support

class GeminiAPI {
  constructor() {
    this.apiKey = "AIzaSyARZyERqMaFInsbRKUA0NxOok77syBNzK8";
    this.model = "gemini-2.0-flash";
    this.baseUrl = "https://generativelanguage.googleapis.com/v1";
    console.log("Gemini API initialized with comprehensive dental context");
  }

  // Generate content using Gemini API
  async generateContent(userMessage, contextData) {
    try {
      // Detect language (Turkish or English)
      const isTurkish = this.detectTurkish(userMessage);
      
      // Create a well-structured prompt with comprehensive data context
      const prompt = this.createComprehensivePrompt(userMessage, contextData, isTurkish);
      
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

  // Detect if the message is in Turkish
  detectTurkish(message) {
    // Turkish-specific characters
    const turkishChars = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü'];
    // Turkish common words
    const turkishWords = ['ve', 'bu', 'bir', 'için', 'nasıl', 'ne', 'nedir', 'merhaba', 'selam', 'iyi'];
    
    // Check for Turkish characters
    for (const char of turkishChars) {
      if (message.includes(char)) {
        return true;
      }
    }
    
    // Check for Turkish words
    const words = message.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (turkishWords.includes(word)) {
        return true;
      }
    }
    
    return false;
  }

  // Create a comprehensive prompt with detailed data context
  createComprehensivePrompt(userMessage, voiceData, isTurkish) {
    // Start with a clear system instruction in the appropriate language
    let prompt = isTurkish 
      ? `Sen diş kliniğindeki müşteri hizmetleri aramalarının ses verilerini analiz eden bir diş AI asistanısın. Mevcut verilere odaklanarak özlü ve yardımcı yanıtlar sunarsın.

KULLANICI SORUSU: ${userMessage}

`
      : `You are a dental AI assistant specializing in analyzing voice data from customer service calls at a dental clinic. You provide concise, helpful responses focused on the specific data available.

USER QUERY: ${userMessage}

`;

    // If we have voice data, add detailed context
    if (voiceData) {
      // Add overview section
      const overviewSection = isTurkish
        ? `MEVCUT VERİ BAĞLAMI:
======================

GENEL BAKIŞ:
Diş kliniği, 3 temsilci (Andrew, Benjamin ve Evan) tarafından yönetilen toplam ${voiceData.summaryStatistics.total_calls} aramanın ses analiz verilerine sahiptir.

TEMSİLCİ DETAYLARI:
`
        : `AVAILABLE DATA CONTEXT:
======================

OVERVIEW:
The dental clinic has voice analysis data for ${voiceData.summaryStatistics.total_calls} total calls handled by 3 agents (Andrew, Benjamin, and Evan).

AGENT DETAILS:
`;

      prompt += overviewSection;

      // Add detailed information about each agent
      const agents = ["Andrew", "Benjamin", "Evan"];
      agents.forEach(agent => {
        if (voiceData.agentPerformance[agent]) {
          const perf = voiceData.agentPerformance[agent];
          
          if (isTurkish) {
            prompt += `
- ${agent}: 
  * ${perf.totalCalls} arama yönetti
  * Performans puanı: %${(perf.averagePerformance * 100).toFixed(1)}
  * Tespit edilen başlıca duygular: ${perf.topEmotions.join(', ')}
  * En çok tartışılan konular: ${perf.topTopics.join(', ')}
  * Belirlenen risk faktörleri: ${perf.riskFactors.join(', ')}
`;
          } else {
            prompt += `
- ${agent}: 
  * Handled ${perf.totalCalls} calls
  * Performance score: ${(perf.averagePerformance * 100).toFixed(1)}%
  * Top emotions detected: ${perf.topEmotions.join(', ')}
  * Most discussed topics: ${perf.topTopics.join(', ')}
  * Risk factors identified: ${perf.riskFactors.join(', ')}
`;
          }
        }
      });

      // Add overall performance metrics
      if (isTurkish) {
        prompt += `
GENEL PERFORMANS:
- En iyi performans gösteren temsilci: ${voiceData.overallPerformance.topPerformingAgent}
- Tüm temsilciler genelinde ortalama performans: %${(voiceData.overallPerformance.averagePerformance * 100).toFixed(1)}
- En sık tespit edilen duygular: ${voiceData.overallPerformance.topEmotions.join(', ')}
- Tüm aramalarda en çok tartışılan konular: ${voiceData.overallPerformance.topTopics.join(', ')}
- Yaygın risk faktörleri: ${voiceData.overallPerformance.commonRiskFactors.join(', ')}

`;
      } else {
        prompt += `
OVERALL PERFORMANCE:
- Top performing agent: ${voiceData.overallPerformance.topPerformingAgent}
- Average performance across all agents: ${(voiceData.overallPerformance.averagePerformance * 100).toFixed(1)}%
- Most common emotions detected: ${voiceData.overallPerformance.topEmotions.join(', ')}
- Most discussed topics across all calls: ${voiceData.overallPerformance.topTopics.join(', ')}
- Common risk factors: ${voiceData.overallPerformance.commonRiskFactors.join(', ')}

`;
      }

      // Add visualization information
      if (isTurkish) {
        prompt += `
MEVCUT GÖRSELLEŞTİRMELER:
${voiceData.visualizations.map(viz => `- ${viz.agent}: ${viz.type} görselleştirmesi`).join('\n')}

`;
      } else {
        prompt += `
AVAILABLE VISUALIZATIONS:
${voiceData.visualizations.map(viz => `- ${viz.agent}: ${viz.type} visualization`).join('\n')}

`;
      }

      // Add specific instructions for response format
      if (isTurkish) {
        prompt += `YANIT TALİMATLARI:
1. Yanıtlarınızda özlü ve doğrudan olun
2. Belirli bir temsilci hakkında konuşurken, adını ve ilgili metriklerini açıkça belirtin
3. Temsilcileri karşılaştırırken, performans metriklerinden spesifik veri noktalarını kullanın
4. Kullanıcı, verilerde bulunmayan bir temsilci veya metrik hakkında sorarsa, bu bilginin mevcut olmadığını açıkça belirtin
5. Yalnızca sağlanan verilere odaklanın - bağlamda olanın ötesinde varsayımlarda bulunmayın
6. Özellikle detaylı analiz istenmedikçe yanıtları 150 kelimenin altında tutun

Şimdi, lütfen kullanıcının sorgusuna bu ses analiz verilerine dayanarak yanıt verin.`;
      } else {
        prompt += `RESPONSE INSTRUCTIONS:
1. Be concise and direct in your answers
2. When discussing a specific agent, clearly reference their name and relevant metrics
3. If comparing agents, use specific data points from their performance metrics
4. If the user asks about an agent or metric not in the data, clearly state that information is not available
5. Focus only on the data provided - don't make assumptions beyond what's in the context
6. Keep responses under 150 words unless detailed analysis is specifically requested

Now, please respond to the user's query based on this voice analysis data.`;
      }
    } else {
      // If no data is available, provide a clear response about limitations
      if (isTurkish) {
        prompt += `NOT: Şu anda hiçbir ses analiz verisi mevcut değil. Sadece diş uygulamaları ve müşteri hizmetleri hakkında genel bilgi verebilirim. Temsilci performansı veya müşteri memnuniyeti hakkında belirli sorularınız varsa, lütfen önce ses analiz verilerini yükleyin.`;
      } else {
        prompt += `NOTE: No voice analysis data is currently available. I can only provide general information about dental practices and customer service. If you have specific questions about agent performance or customer satisfaction, please upload voice analysis data first.`;
      }
    }

    return prompt;
  }
}

export default new GeminiAPI();
