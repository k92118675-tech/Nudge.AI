import { useState } from 'react';
import { motion } from 'motion/react';
import { User, ViewType } from '../types';
import { StorageService } from '../lib/storage';
import { User as UserIcon, Briefcase, Settings as SettingsIcon, LogOut, Crown, Check } from 'lucide-react';

export const SettingsView = ({ user, setUser, setView }: { user: User, setUser: (u: User) => void, setView: (v: ViewType) => void }) => {
  const [formData, setFormData] = useState(user);

  const handleSave = () => {
    StorageService.saveUser(formData);
    setUser(formData);
    // Show toast or feedback
  };

  const handleLogout = () => {
    StorageService.clearUser();
    window.location.reload();
  };

  const handleClearAll = () => {
    StorageService.clearAll();
    window.location.reload();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-12 font-display">Settings</h1>

      <div className="space-y-8">
        <div className="glass-card space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <UserIcon size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-gray-400 text-sm">{user.targetRole} • {user.experienceLevel}</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Display Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary"
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
            <div>
              <label className="block text-sm text-gray-400 mb-2">Interview Preference</label>
              <div className="flex gap-4">
                {['voice', 'video'].map((pref) => (
                  <button
                    key={pref}
                    disabled={pref === 'video'}
                    onClick={() => setFormData({ ...formData, preference: pref as any })}
                    className={`flex-grow py-3 rounded-xl border transition-all capitalize ${formData.preference === pref ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'} ${pref === 'video' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    {pref === 'video' ? 'Video (WIP)' : pref}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-4">Subscription Plan</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, isPro: false })}
                  className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${!formData.isPro ? 'bg-white/10 border-white/20 ring-2 ring-primary/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  {!formData.isPro && <div className="absolute top-2 right-2 text-primary"><Check size={16} /></div>}
                  <div className="font-bold mb-1">Free</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Basic Analysis</div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, isPro: true })}
                  className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${formData.isPro ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  {formData.isPro && <div className="absolute top-2 right-2 text-primary"><Check size={16} /></div>}
                  <div className="flex items-center gap-2 font-bold mb-1">
                    Premium <Crown size={14} className="text-yellow-500" />
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Advanced Insights</div>
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-3 px-1">
                {formData.isPro 
                  ? "Premium plan includes tone analysis, stutter score, and detailed performance breakdown." 
                  : "Free plan includes generic feedback and basic interview metrics."}
              </p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold mt-4 hover:bg-primary/90 transition-all"
          >
            Save Changes
          </button>
        </div>

        <div className="glass-card border-red-500/20 space-y-6">
          <h4 className="text-red-400 font-bold mb-4">Danger Zone</h4>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm">Logout of your current session. Your data will be saved.</p>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-white bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl transition-all font-bold w-fit"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
              <p className="text-gray-400 text-sm">Once you clear your data, it cannot be recovered. This will reset your progress and profile.</p>
              <button 
                onClick={handleClearAll}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-all font-bold w-fit"
              >
                <LogOut size={18} /> Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
