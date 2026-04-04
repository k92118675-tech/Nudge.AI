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
      You are an expert interview coach specializing in the STAR (Situation, Task, Action, Result) method. 
      Analyze the candidate's response to the following question: "${question}".
      
      If an audio file is provided, you MUST listen to it carefully to:
      1. Transcribe the content to identify the STAR components.
      2. Analyze the speaker's tone, pace, energy, and confidence.
      3. Identify any stutters, filler words (um, ah, like), or long pauses.
      
      If the user response text is provided but no audio, focus on the content structure.
      
      Provide a detailed analysis in JSON format.
      
      Required fields:
      - overallScore: 0-100 (weighted average of performance)
      - clarity: 0-100 (how easy it was to follow the narrative)
      - confidence: 0-100 (based on tone and directness)
      - impact: 0-100 (how well the result/outcome was conveyed)
      - starBreakdown: { situation, task, action, result } each with:
          - present: boolean (true if this component was clearly identifiable)
          - excerpt: string (a direct quote or summary of this part from the response)
          - suggestion: string (how to improve this specific part of the STAR method)
      - recruiterPerspective: A professional paragraph from a hiring manager's point of view, explaining why they would or wouldn't hire based on this specific answer.
      - rewrittenAnswer: A high-impact, perfectly structured STAR version of the answer that the candidate should have given.
      - improvementTips: Array of 3 specific, actionable tips for next time.
      - toneAnalysis: (Premium) A detailed analysis of the speaker's vocal tone, energy levels, and emotional resonance.
      - stutterScore: (Premium) 0-100 (100 being perfectly fluent, lower if there are many filler words or hesitations).
      - genericFeedback: (Free) A comprehensive summary of the performance for users on the free tier.
      - transcription: A full, accurate transcription of the candidate's response (especially if audio was provided).
      
      User Plan Status: ${isPro ? "Premium (Pro)" : "Free"}.
      If the user is on the Free plan, provide a very detailed 'genericFeedback' but keep 'toneAnalysis' and 'stutterScore' brief. 
      If the user is Premium, provide deep, actionable insights for ALL fields.
    `;

    const contents: any[] = [];
    
    if (userResponse) {
      contents.push({ text: `Candidate's Written Response: ${userResponse}` });
    }
    
    if (audioData) {
      contents.push({
        inlineData: {
          data: audioData.data,
          mimeType: audioData.mimeType
        }
      });
      contents.push({ text: "Please analyze the provided audio for the interview response." });
    }

    if (contents.length === 0) {
      throw new Error("No response content provided (neither text nor audio).");
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
              },
              required: ["situation", "task", "action", "result"]
            },
            recruiterPerspective: { type: Type.STRING },
            rewrittenAnswer: { type: Type.STRING },
            improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            toneAnalysis: { type: Type.STRING },
            stutterScore: { type: Type.NUMBER },
            genericFeedback: { type: Type.STRING },
            transcription: { type: Type.STRING },
          },
          required: ["overallScore", "clarity", "confidence", "impact", "starBreakdown", "recruiterPerspective", "rewrittenAnswer", "improvementTips", "genericFeedback", "transcription"]
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
