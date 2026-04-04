export type User = {
  id: string;
  name: string;
  targetRole: string;
  experienceLevel: 'fresher' | '0-1yr' | '1-3yr';
  preference: 'voice' | 'video';
  isPro: boolean;
}

export type FeedbackResult = {
  overallScore: number;
  clarity: number;
  confidence: number;
  impact: number;
  toneAnalysis?: string;
  stutterScore?: number;
  genericFeedback?: string;
  transcription?: string;
  starBreakdown: {
    situation: { present: boolean; excerpt: string; suggestion: string };
    task: { present: boolean; excerpt: string; suggestion: string };
    action: { present: boolean; excerpt: string; suggestion: string };
    result: { present: boolean; excerpt: string; suggestion: string };
  };
  recruiterPerspective: string;
  rewrittenAnswer: string;
  improvementTips: string[];
  isMockData: boolean;
}

export type InterviewSession = {
  id: string;
  category: string;
  question: string;
  userResponse: string;
  audioUrl?: string;
  feedback: FeedbackResult;
  durationSeconds: number;
  timestamp: string; // ISO string
}

export type MetricSummary = {
  overallReadiness: number;
  avgStarScore: number;
  totalSessions: number;
  currentStreak: number;
}

export type ViewType = 'landing' | 'onboarding' | 'dashboard' | 'practice' | 'gd' | 'progress' | 'settings';
