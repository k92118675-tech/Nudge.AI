import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { User, InterviewSession } from '../types';
import { StorageService } from '../lib/storage';
import { Flame, Download, TrendingUp, ChevronDown, ChevronUp, Play, Mic, CheckCircle2, AlertTriangle, Lock, ArrowRight } from 'lucide-react';

export const ProgressView = ({ user, sessions }: { user: User, sessions: InterviewSession[] }) => {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const metrics = StorageService.getMetrics();
  
  // Chart data logic
  const lineChartData = sessions.length > 0 
    ? sessions.slice(-10).map((s, i) => ({ name: `S${i+1}`, score: s.feedback.overallScore }))
    : [
        { name: 'S1', score: 65 },
        { name: 'S2', score: 72 },
        { name: 'S3', score: 68 },
        { name: 'S4', score: 85 },
        { name: 'S5', score: 92 },
      ];

  // Radar chart logic
  const categories = ['Personality', 'Discipline', 'Emotions', 'Leadership', 'Teamwork'];
  const radarData = categories.map(cat => {
    const catSessions = sessions.filter(s => s.category.toLowerCase().includes(cat.toLowerCase()));
    const avg = catSessions.length > 0 
      ? catSessions.reduce((acc, s) => acc + s.feedback.overallScore, 0) / catSessions.length 
      : 0;
    return { subject: cat, A: avg, fullMark: 100 };
  });

  return (
    <div className="p-8 space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-display">Performance Analytics</h1>
        <button className="flex items-center gap-2 bg-white/5 px-6 py-2 rounded-full text-sm hover:bg-white/10 transition-all">
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="glass-card h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-primary" size={20} />
            <h3 className="text-xl font-bold">Performance Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ color: '#3944BC' }}
              />
              <Line type="monotone" dataKey="score" stroke="#3944BC" strokeWidth={3} dot={{ fill: '#3944BC' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="glass-card h-[400px]">
          <h3 className="text-xl font-bold mb-8">Skill Breakdown</h3>
          <ResponsiveContainer width="100%" height="80%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#ffffff10" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#ffffff10" />
              <Radar name="Skills" dataKey="A" stroke="#3944BC" fill="#3944BC" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session History */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold font-display">Session History</h3>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="glass-card text-center py-12 text-gray-500">
              No interview sessions recorded yet. Start practicing to see your progress!
            </div>
          ) : (
            sessions.slice().reverse().map((session) => (
              <div key={session.id} className="glass-card overflow-hidden">
                <div 
                  className="flex items-center justify-between cursor-pointer p-4 hover:bg-white/5 transition-all"
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${session.feedback.overallScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' : session.feedback.overallScore >= 60 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                      {session.feedback.overallScore}%
                    </div>
                    <div>
                      <h4 className="font-bold text-sm md:text-base">{session.question}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{session.category}</span>
                        <span className="text-[10px] text-gray-600">•</span>
                        <span className="text-[10px] text-gray-500">{new Date(session.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {session.audioBase64 && (
                      <div className="hidden md:flex items-center gap-1 text-primary text-[10px] font-bold uppercase tracking-widest">
                        <Mic size={12} /> Recorded
                      </div>
                    )}
                    {expandedSession === session.id ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSession === session.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-white/2"
                    >
                      <div className="p-6 space-y-8">
                        {/* Audio Playback */}
                        {session.audioBase64 && (
                          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <button 
                              onClick={() => {
                                const audio = new Audio(`data:audio/webm;base64,${session.audioBase64}`);
                                audio.play();
                              }}
                              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-all"
                            >
                              <Play size={20} />
                            </button>
                            <div className="flex-grow">
                              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Voice Recording</div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-full opacity-30" />
                              </div>
                            </div>
                            <div className="text-xs font-mono text-gray-500">{session.durationSeconds}s</div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Transcription & Feedback */}
                          <div className="space-y-6">
                            <div>
                              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Your Response</h5>
                              <p className="text-sm text-gray-300 leading-relaxed italic">"{session.userResponse || session.feedback.transcription}"</p>
                            </div>
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                              <h5 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">AI Feedback</h5>
                              <p className="text-sm text-gray-300 italic">"{session.feedback.genericFeedback || session.feedback.recruiterPerspective}"</p>
                            </div>
                          </div>

                          {/* STAR Breakdown */}
                          <div className="space-y-6">
                            <div className="flex justify-between items-center">
                              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500">STAR Breakdown</h5>
                              {!user.isPro && <Lock size={12} className="text-primary" />}
                            </div>

                            {!user.isPro ? (
                              <div className="relative">
                                <div className="space-y-3 blur-[3px] select-none opacity-50">
                                  {['Situation', 'Task', 'Action', 'Result'].map(s => (
                                    <div key={s} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                      <div className="text-xs font-bold">{s}</div>
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                  <p className="text-xs font-bold text-primary mb-2">Premium Feature</p>
                                  <p className="text-[10px] text-gray-500 mb-3">Unlock detailed STAR analysis for all your sessions.</p>
                                  <button className="text-[10px] font-bold bg-primary/20 text-primary px-4 py-1.5 rounded-full hover:bg-primary/30 transition-all flex items-center gap-1">
                                    Upgrade <ArrowRight size={10} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {Object.entries(session.feedback.starBreakdown).map(([key, value]) => {
                                  const val = value as { present: boolean; excerpt: string; suggestion: string };
                                  return (
                                    <div key={key} className={`p-4 rounded-xl border ${val.present ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold capitalize">{key}</span>
                                        {val.present ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-red-500" />}
                                      </div>
                                      <p className="text-[11px] text-gray-400 italic line-clamp-2">"{val.excerpt}"</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
