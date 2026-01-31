
import { GoogleGenAI, Type } from "@google/genai";
import { SolarInputData, AIAdviceResponse, GroundingSource } from "../types";

export const getSolarAIAdvice = async (data: SolarInputData): Promise<AIAdviceResponse> => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey.length < 10) {
    throw new Error("AUTH_ERROR: Invalid or missing API Key.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a technical solar analyst for the Indian market. 
Provide informational engineering assessments based on rooftop metrics.
Verify current state-specific solar policies and irradiance in ${data.location}.
Output must be strictly valid JSON.`;

  const userPrompt = `
    Analyze:
    - Location: ${data.location}, India
    - Rooftop Area: ${data.rooftopAreaValue} ${data.rooftopAreaUnit}
    - Usable Area: ${data.usableAreaPercentage}%
    - Grid Rate: ${data.unitCost} Rs/kWh
    
    Return JSON: summary, benefits (4 items), environmental_impact, recommendations (3 items).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            environmental_impact: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "benefits", "environmental_impact", "recommendations"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_AI_RESPONSE");
    
    const parsed: AIAdviceResponse = JSON.parse(text);
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) sources.push({ title: chunk.web.title || "Reference", uri: chunk.web.uri });
      });
    }

    return { 
      ...parsed, 
      sources: Array.from(new Map(sources.map(s => [s.uri, s])).values()) 
    };
  } catch (error: any) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
};
