import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
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
      You are a world-class AI Interview Coach and Hiring Manager. Your goal is to provide rigorous, high-fidelity feedback on a candidate's interview response.
      
      The candidate is answering the following question: "${question}".
      
      CRITICAL INSTRUCTIONS:
      1. DEPTH OF ANALYSIS: Whether the answer is short/nonsensical or long/professional, you MUST provide a deep, reasoned analysis. 
         - For professional answers: Do not rush. Analyze the nuance of their STAR structure and the sophistication of their vocal delivery.
         - For nonsensical answers: Explain WHY it is nonsensical from a recruiter's perspective and how it fails the STAR method.
      
      2. AUDIO ANALYSIS: If audio is provided, you MUST perform a deep vocal analysis. Listen for:
         - Pace: Is it too fast (anxious) or too slow (uncertain)?
         - Tone: Is it professional, enthusiastic, or monotone?
         - Confidence: Are there hesitations, rising intonation at the end of sentences (upspeaking), or vocal fry?
         - Fluency: Count filler words (um, ah, like, you know) and identify stutters or awkward pauses.
      
      3. STAR METHOD VALIDATION: You MUST map the candidate's response (from audio transcription or text) to the STAR (Situation, Task, Action, Result) framework.
         - Be strict. If a component is missing or weak, mark 'present: false' and provide a specific 'suggestion'.
         - For 'excerpt', provide the EXACT words (or a very close paraphrase) from the candidate's response that represent that component.
      
      4. PERSONALIZED FEEDBACK: Avoid generic advice. Your feedback MUST be directly tied to what the candidate actually said or how they sounded.
         - If they sounded nervous, tell them exactly where they started rushing.
         - If their 'Result' was weak, tell them what specific metrics or outcomes they should have mentioned based on their 'Action'.
      
      5. RECRUITER PERSPECTIVE: Write this as if you are a Senior Recruiter at a top-tier company (e.g., Google, McKinsey). Be honest, professional, and insightful.
      
      6. TRANSCRIPTION: Provide a verbatim transcription of the audio. This is the foundation of your analysis.
      
      JSON STRUCTURE REQUIREMENTS:
      - overallScore: 0-100 (Be realistic. 90+ is exceptional).
      - clarity: 0-100 (Logical flow and articulation).
      - confidence: 0-100 (Vocal presence and directness).
      - impact: 0-100 (Strength of the 'Result' and overall impression).
      - starBreakdown: { situation, task, action, result } each with:
          - present: boolean
          - excerpt: string (Direct quote from the candidate)
          - suggestion: string (Actionable improvement)
      - recruiterPerspective: A professional, high-stakes assessment.
      - rewrittenAnswer: A "Gold Standard" version of their specific story.
      - improvementTips: 3 highly specific tips.
      - toneAnalysis: (Premium) Detailed breakdown of vocal performance.
      - stutterScore: (Premium) 0-100 (100 = perfectly fluent).
      - genericFeedback: (Free) Comprehensive summary.
      - transcription: Verbatim text.

      User Plan: ${isPro ? "Premium (Pro)" : "Free"}.
      - For Free users: Provide excellent content analysis but keep vocal metrics (toneAnalysis, stutterScore) high-level.
      - For Pro users: Provide the most granular, detailed vocal and content analysis possible.
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

    const responsePromise = ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
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

    const timeoutPromise = new Promise<never>((_, reject) => {
      // Reduced timeout to 60s as requested
      setTimeout(() => reject(new Error("Analysis timed out. Please try a shorter response or check your connection.")), 60000);
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);

    if (!response.text) {
      throw new Error("AI returned an empty response. Please try again.");
    }

    const result = JSON.parse(response.text);
    
    return {
      ...result,
      isMockData: false
    };
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    const errorMessage = error?.message || "Unknown error occurred during AI analysis.";
    throw new Error(`AI Analysis Failed: ${errorMessage}`);
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
