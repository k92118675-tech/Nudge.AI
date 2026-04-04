import { User, InterviewSession, MetricSummary } from '../types';

const USER_KEY = 'nudge_user';
const SESSIONS_KEY = 'nudge_sessions';

export const StorageService = {
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getSessions: (): InterviewSession[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSession: (session: InterviewSession) => {
    const sessions = StorageService.getSessions();
    sessions.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  getMetrics: (): MetricSummary => {
    const sessions = StorageService.getSessions();
    if (sessions.length === 0) {
      return {
        overallReadiness: 0,
        avgStarScore: 0,
        totalSessions: 0,
        currentStreak: 0
      };
    }

    const avgScore = sessions.reduce((acc, s) => acc + s.feedback.overallScore, 0) / sessions.length;
    
    // Calculate streak
    const dates = sessions.map(s => new Date(s.timestamp).toDateString());
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      streak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const d1 = new Date(uniqueDates[i]);
        const d2 = new Date(uniqueDates[i+1]);
        const diff = (d1.getTime() - d2.getTime()) / 86400000;
        if (diff === 1) streak++;
        else break;
      }
    }

    return {
      overallReadiness: Math.round(avgScore * 0.9), // Mock readiness logic
      avgStarScore: Math.round(avgScore),
      totalSessions: sessions.length,
      currentStreak: streak
    };
  },

  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  clearAll: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSIONS_KEY);
  }
};
