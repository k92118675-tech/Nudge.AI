import { motion } from 'motion/react';
import { Sparkles, Zap, Shield, Target, Rocket } from 'lucide-react';
import { Pricing } from '../components/Pricing';
import { User } from '../types';
import { StorageService } from '../lib/storage';

export const ProView = ({ user, setUser }: { user: User, setUser: (u: User) => void }) => {
  const handleUpgrade = () => {
    const updatedUser = { ...user, isPro: true };
    setUser(updatedUser);
    StorageService.saveUser(updatedUser);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-16 pb-24">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
        >
          <Sparkles size={14} /> Nudge Pro
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
          Supercharge Your <span className="text-primary">Interview Prep</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Unlock the full power of AI-driven interview coaching and get the edge you need to land your dream job.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <Zap size={24} />, title: 'Deep Analysis', desc: 'Get granular feedback on every sentence you speak.' },
          { icon: <Target size={24} />, title: 'STAR Precision', desc: 'Master the STAR method with AI-guided excerpts.' },
          { icon: <Shield size={24} />, title: 'Confidence Score', desc: 'Measure and improve your vocal presence and energy.' },
          { icon: <Rocket size={24} />, title: 'Priority Access', desc: 'Skip the queue with faster AI response times.' }
        ].map((benefit, idx) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 space-y-4 hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              {benefit.icon}
            </div>
            <h3 className="font-bold text-lg">{benefit.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-display">Choose Your Plan</h2>
          <p className="text-gray-500 mt-2">No hidden fees. Cancel anytime.</p>
        </div>
        <Pricing onUpgrade={handleUpgrade} />
      </div>
    </div>
  );
};
