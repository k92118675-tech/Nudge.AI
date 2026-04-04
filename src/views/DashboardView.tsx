import { motion } from 'motion/react';
import { User, InterviewSession } from '../types';
import { StorageService } from '../lib/storage';
import { CheckCircle2, TrendingUp, Zap, Clock } from 'lucide-react';

export const DashboardView = ({ user, sessions }: { user: User, sessions: InterviewSession[] }) => {
  const metrics = StorageService.getMetrics();

  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl font-bold mb-2 font-display">Good morning, {user.name} 👋</h1>
        <p className="text-gray-400">Ready to crush your next interview?</p>
      </motion.div>

      {/* KPI Row */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
            <Zap />
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Sessions</div>
            <div className="text-2xl font-bold">{metrics.totalSessions}</div>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500">
            <TrendingUp />
          </div>
          <div>
            <div className="text-sm text-gray-400">Avg. STAR Score</div>
            <div className="text-2xl font-bold">{metrics.avgStarScore}%</div>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 />
          </div>
          <div>
            <div className="text-sm text-gray-400">Readiness %</div>
            <div className="text-2xl font-bold">{metrics.overallReadiness}%</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Sessions */}
        <div className="lg:col-span-3 glass-card overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold mb-6">Recent Sessions</h3>
          <div className="space-y-4 overflow-y-auto flex-grow pr-2">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="mx-auto mb-4 opacity-20" size={48} />
                <p>No sessions yet. Start practicing!</p>
              </div>
            ) : (
              sessions.slice().reverse().map((s) => (
                <div key={s.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-bold truncate max-w-[150px]">{s.question}</div>
                    <div className={`text-xs px-2 py-1 rounded-full font-bold ${s.feedback.overallScore > 80 ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                      {s.feedback.overallScore}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(s.timestamp).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
