import { motion } from 'motion/react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  Play, 
  ChevronRight, 
  Users, 
  Mic, 
  Video, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { ViewType } from '../types';
import { Footer } from '../components/Footer';

export const LandingView = ({ setView }: { setView: (v: ViewType) => void }) => {
  return (
    <div className="min-h-screen selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-secondary/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-primary w-8 h-8" />
              <span className="text-xl font-bold font-display tracking-tight">
                Nudge<span className="text-primary">.ai</span>
              </span>
            </div>
            <button 
              onClick={() => setView('onboarding')}
              className="hidden sm:block text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Login
            </button>
          </div>
          <button 
            onClick={() => setView('onboarding')}
            className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden gradient-bg">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Built for freshers. Backed by AI.
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.1] mb-6">
              Turn Weak Answers Into <span className="text-primary">Strong Stories</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              Stop Winging. Start Winning. Master the art of the behavioral interview with real-time AI feedback.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setView('onboarding')}
                className="bg-success text-secondary px-8 py-4 rounded-full font-bold text-lg hover:bg-success/90 transition-all flex items-center gap-2 shadow-lg shadow-success/20 active:scale-95"
              >
                Start Free <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square md:aspect-video rounded-3xl border border-white/10 shadow-2xl overflow-hidden glass p-4 md:p-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 opacity-30" />
              
              {/* Main Interview Card */}
              <div className="relative z-10 w-full max-w-md bg-accent/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Mock Interview Session</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Active • 02:45</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="h-2 bg-white/10 rounded-full w-3/4" />
                  <div className="h-2 bg-white/5 rounded-full w-1/2" />
                  <div className="h-2 bg-white/5 rounded-full w-2/3" />
                </div>
                
                <div className="flex justify-center gap-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 animate-pulse border border-red-500/20">
                    <Mic size={24} />
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400 border border-white/10">
                    <Video size={24} />
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400 border border-white/10">
                    <MessageSquare size={24} />
                  </div>
                </div>
              </div>

              {/* Floating Feedback Card */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 right-6 md:top-12 md:right-12 z-20 bg-primary/90 text-white p-4 rounded-2xl shadow-2xl border border-white/20 max-w-[180px] hidden sm:block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed">"Try using the STAR method to structure your impact."</p>
              </motion.div>

              {/* Floating Score Card */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-20 bg-accent/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/10 hidden sm:block"
              >
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Confidence</div>
                <div className="text-2xl font-bold text-primary">84%</div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary w-[84%]" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-accent/50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="glass-card">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <BrainCircuit />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Feedback Engine</h3>
            <p className="text-gray-400">Instant analysis of your responses with actionable tips.</p>
          </div>
          <div className="glass-card">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <CheckCircle2 />
            </div>
            <h3 className="text-xl font-bold mb-3">STAR Method Coach</h3>
            <p className="text-gray-400">Structure your answers using the industry-standard framework.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
