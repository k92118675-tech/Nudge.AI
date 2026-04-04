import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Mic, 
  BarChart3, 
  Settings as SettingsIcon, 
  BrainCircuit, 
  Menu, 
  X, 
  User as UserIcon
} from 'lucide-react';
import { ViewType, User, InterviewSession } from './types';
import { StorageService } from './lib/storage';

// Views
import { LandingView } from './views/LandingView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { PracticeView } from './views/PracticeView';
import { GDArenaView } from './views/GDArenaView';
import { ProgressView } from './views/ProgressView';
import { SettingsView } from './views/SettingsView';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = StorageService.getUser();
    const storedSessions = StorageService.getSessions();
    setUser(storedUser);
    setSessions(storedSessions);

    if (storedUser) {
      setCurrentView('dashboard');
    }
  }, []);

  const refreshSessions = () => {
    setSessions(StorageService.getSessions());
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <Home size={20} /> },
    { id: 'practice', label: 'Practice', icon: <Mic size={20} /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  if (currentView === 'landing' && !user) {
    return <LandingView setView={setCurrentView} />;
  }

  if (currentView === 'onboarding' || (!user && currentView !== 'landing')) {
    return <OnboardingView setView={setCurrentView} setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-secondary text-white flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] bg-accent border-r border-white/5 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2 mb-8">
          <BrainCircuit className="text-primary w-8 h-8" />
          <span className="text-xl font-bold font-display">Nudge<span className="text-primary">.ai</span></span>
        </div>
        <nav className="flex-grow px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => {
              if (user) {
                const updatedUser = { ...user, isPro: !user.isPro };
                setUser(updatedUser);
                StorageService.saveUser(updatedUser);
              }
            }}
            className="w-full flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-left group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${user?.isPro ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'bg-white/5 text-gray-500'}`}>
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden flex-grow">
              <div className="text-sm font-bold truncate group-hover:text-primary transition-colors">{user?.name}</div>
              <div className={`text-[10px] uppercase tracking-widest font-bold ${user?.isPro ? 'text-primary' : 'text-gray-500'}`}>
                {user?.isPro ? 'Pro Member' : 'Free Plan'}
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-accent/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="md:hidden flex items-center gap-2">
            <BrainCircuit className="text-primary w-6 h-6" />
            <span className="text-lg font-bold font-display">Nudge<span className="text-primary">.ai</span></span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={() => {
                if (user) {
                  const updatedUser = { ...user, isPro: !user.isPro };
                  setUser(updatedUser);
                  StorageService.saveUser(updatedUser);
                }
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${user?.isPro ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-gray-500'}`}
            >
              {user?.isPro ? 'Pro' : 'Free'}
            </button>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary border border-primary/20">
              <UserIcon size={16} />
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-grow overflow-y-auto pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && user && <DashboardView user={user} sessions={sessions} />}
              {currentView === 'practice' && user && <PracticeView user={user} setView={setCurrentView} refreshSessions={refreshSessions} />}
              {currentView === 'progress' && <ProgressView sessions={sessions} />}
              {currentView === 'settings' && user && <SettingsView user={user} setUser={setUser} setView={setCurrentView} />}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-accent/90 backdrop-blur-md border-t border-white/5 flex justify-around items-center h-16 px-2 z-40">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={`flex flex-col items-center gap-1 transition-all ${currentView === item.id ? 'text-primary' : 'text-gray-500'}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

