import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateFeedback(
  userResponse: string,
  question: string,
  isPro: boolean,
  audioData?: { data: string; mimeType: string }
): Promise<FeedbackResult> {
  try {
    const model = "gemini-3-flash-preview";
    
    const systemInstruction = `
      You are an expert interview coach. Analyze the candidate's response to the following question: "${question}".
      
      If audio is provided, analyze the tone, pace, and clarity of speech.
      
      Provide a detailed analysis in JSON format.
      
      Required fields:
      - overallScore: 0-100
      - clarity: 0-100
      - confidence: 0-100
      - impact: 0-100
      - starBreakdown: { situation, task, action, result } each with { present: boolean, excerpt: string, suggestion: string }
      - recruiterPerspective: A paragraph from a recruiter's POV.
      - rewrittenAnswer: A high-impact version of the answer.
      - improvementTips: Array of 3 specific tips.
      - toneAnalysis: (Premium) Analysis of the speaker's tone and energy.
      - stutterScore: (Premium) 0-100 (100 being perfectly fluent).
      - genericFeedback: (Free) A brief, high-level summary of the performance.
      
      If the user is NOT a Pro member (isPro: ${isPro}):
      - Provide a very detailed 'genericFeedback'.
      - Provide very brief/vague 'toneAnalysis' and 'stutterScore'.
      - Provide simplified 'starBreakdown'.
      Else:
      - Provide deep, actionable insights for all fields.
    `;

    const contents: any[] = [
      { text: `Question: ${question}\nCandidate Response: ${userResponse || "[Audio Only]"}` }
    ];

    if (audioData) {
      contents.push({
        inlineData: {
          data: audioData.data,
          mimeType: audioData.mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            clarity: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            impact: { type: Type.NUMBER },
            starBreakdown: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, excerpt: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
                task: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, excerpt: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
                action: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, excerpt: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
                result: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, excerpt: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
              }
            },
            recruiterPerspective: { type: Type.STRING },
            rewrittenAnswer: { type: Type.STRING },
            improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            toneAnalysis: { type: Type.STRING },
            stutterScore: { type: Type.NUMBER },
          },
          required: ["overallScore", "clarity", "confidence", "impact", "starBreakdown", "recruiterPerspective", "rewrittenAnswer", "improvementTips"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      ...result,
      isMockData: false
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Fallback to mock if API fails
    return getMockFeedback(userResponse);
  }
}

function getMockFeedback(userResponse: string): FeedbackResult {
  return {
    overallScore: 75,
    clarity: 80,
    confidence: 70,
    impact: 75,
    starBreakdown: {
      situation: { present: true, excerpt: "...", suggestion: "..." },
      task: { present: true, excerpt: "...", suggestion: "..." },
      action: { present: true, excerpt: "...", suggestion: "..." },
      result: { present: false, excerpt: "...", suggestion: "..." },
    },
    recruiterPerspective: "Good start, but needs more detail.",
    rewrittenAnswer: "...",
    improvementTips: ["Tip 1", "Tip 2", "Tip 3"],
    toneAnalysis: "Neutral tone detected.",
    stutterScore: 85,
    isMockData: true
  };
}
