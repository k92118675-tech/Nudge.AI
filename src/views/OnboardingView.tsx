import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, User, Briefcase, Settings } from 'lucide-react';
import { User as UserType, ViewType } from '../types';
import { StorageService } from '../lib/storage';

export const OnboardingView = ({ setView, setUser }: { setView: (v: ViewType) => void, setUser: (u: UserType) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserType>>({
    name: '',
    targetRole: 'Engineering',
    experienceLevel: 'fresher',
    preference: 'voice',
    isPro: false
  });

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else {
      const newUser = { ...formData, id: Math.random().toString(36).substr(2, 9) } as UserType;
      StorageService.saveUser(newUser);
      setUser(newUser);
      setView('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg px-6">
      <div className="max-w-md w-full glass p-8 rounded-3xl border border-white/10 shadow-2xl">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-8">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Let's get started</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Role</label>
                <select 
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary appearance-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="CEO">CEO</option>
                  <option value="CFO">CFO</option>
                  <option value="CTO">CTO</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Experience Level</h2>
            <div className="grid gap-4">
              {['fresher', '0-1yr', '1-3yr'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, experienceLevel: level as any })}
                  className={`p-4 rounded-xl border transition-all text-left ${formData.experienceLevel === level ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className="font-bold capitalize">{level}</div>
                  <div className="text-xs text-gray-400">{level === 'fresher' ? 'Just starting out' : 'Some experience'}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Interview Preference</h2>
            <div className="grid gap-4">
              {['voice', 'video'].map((pref) => (
                <button
                  key={pref}
                  disabled={pref === 'video'}
                  onClick={() => setFormData({ ...formData, preference: pref as any })}
                  className={`p-4 rounded-xl border transition-all text-left ${formData.preference === pref ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'} ${pref === 'video' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  <div className="font-bold capitalize">{pref === 'video' ? 'Video (Coming Soon)' : pref}</div>
                  <div className="text-xs text-gray-400">Practice using {pref} inputs</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center text-success mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">All set!</h2>
            <p className="text-gray-400 mb-8">Your personalized dashboard is ready.</p>
          </motion.div>
        )}

        <button 
          onClick={nextStep}
          disabled={step === 1 && !formData.name}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold mt-8 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 4 ? 'Go to Dashboard' : 'Next'}
        </button>
      </div>
    </div>
  );
};
