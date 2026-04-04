import { useState } from 'react';
import { motion } from 'motion/react';
import { User, ViewType, InterviewSession } from '../types';
import { StorageService } from '../lib/storage';
import { generateFeedback } from '../lib/ai';
import { MessageSquare, Send, ChevronLeft, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

const topics = [
  "Is AI replacing human jobs?",
  "Should college education be free for everyone?",
  "Work from home vs. Office: The future of work.",
  "Social media: A boon or a bane?",
  "Cryptocurrency: Future of finance or a bubble?",
];

export const GDArenaView = ({ user, setView, refreshSessions }: { user: User, setView: (v: ViewType) => void, refreshSessions: () => void }) => {
  const [state, setState] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [selectedTopic, setSelectedTopic] = useState("");
  const [argument, setArgument] = useState("");
  const [feedback, setFeedback] = useState<any>(null);

  const handleSubmit = async () => {
    setState('C');
    const result = await generateFeedback(argument, selectedTopic, user.isPro);
    
    // Custom GD feedback structure
    const gdFeedback = {
      score: result.overallScore,
      strengths: ["Clear opening statement", "Logical flow of arguments"],
      missing: ["Lack of statistical data", "Could address counter-arguments better"],
      counter: "While AI automates tasks, it also creates new roles in AI management and ethics."
    };
    
    setFeedback(gdFeedback);

    const session: InterviewSession = {
      id: Math.random().toString(36).substr(2, 9),
      category: 'GD',
      question: selectedTopic,
      userResponse: argument,
      feedback: result, // Reusing result for metrics
      durationSeconds: 0,
      timestamp: new Date().toISOString()
    };
    
    StorageService.saveSession(session);
    refreshSessions();
    setState('D');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {state === 'A' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-3xl font-bold mb-8 font-display">GD Arena</h2>
          <p className="text-gray-400 mb-8">Pick a topic and build your argument. Our AI will analyze your logic and persuasion.</p>
          <div className="space-y-4">
            {topics.map((topic, i) => (
              <button
                key={i}
                onClick={() => { setSelectedTopic(topic); setState('B'); }}
                className="w-full glass-card text-left hover:border-primary transition-all flex justify-between items-center group"
              >
                <span className="font-bold">{topic}</span>
                <ChevronLeft size={20} className="rotate-180 text-gray-500 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {state === 'B' && (
        <div className="space-y-6">
          <button onClick={() => setState('A')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-8">{selectedTopic}</h2>
            <textarea 
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Write your argument here..."
              className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-primary resize-none mb-6"
            />
            <button 
              disabled={argument.length < 50}
              onClick={handleSubmit}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              Analyze Argument <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {state === 'C' && (
        <div className="fixed inset-0 bg-secondary/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6">
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-8">
            <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} />
          </div>
          <h3 className="text-xl font-bold mb-2">Analyzing your argument...</h3>
        </div>
      )}

      {state === 'D' && feedback && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold font-display">GD Analysis</h2>
            <button onClick={() => setView('dashboard')} className="bg-primary px-6 py-2 rounded-full font-bold">Dashboard</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card text-center">
              <div className="text-5xl font-bold text-primary mb-2">{feedback.score}%</div>
              <div className="text-gray-400 uppercase tracking-widest text-xs">Argument Strength</div>
            </div>
            <div className="glass-card">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-400"><CheckCircle2 size={18} /> Strengths</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {feedback.strengths.map((s: string, i: number) => <li key={i}>• {s}</li>)}
              </ul>
            </div>
            <div className="glass-card">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-red-400"><AlertTriangle size={18} /> Missing Points</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {feedback.missing.map((m: string, i: number) => <li key={i}>• {m}</li>)}
              </ul>
            </div>
            <div className="glass-card bg-primary/5 border-primary/20">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-primary"><Lightbulb size={18} /> Counter-Argument</h3>
              <p className="text-sm text-gray-300 italic">"{feedback.counter}"</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
