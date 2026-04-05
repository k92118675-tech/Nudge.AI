import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Lightbulb, 
  Frown, 
  Mic, 
  Video,
  Send, 
  ChevronLeft, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  RotateCcw,
  Camera,
  User as UserIcon,
  Target,
  Heart,
  Briefcase
} from 'lucide-react';
import { User, InterviewSession, ViewType, FeedbackResult } from '../types';
import { StorageService } from '../lib/storage';
import { generateFeedback } from '../lib/ai';

const questionnaires = [
  { id: 'personality', title: 'Personality Check', icon: <UserIcon size={24} />, description: 'Assess your cultural fit and interpersonal traits.', difficulty: 'Medium' },
  { id: 'discipline', title: 'Discipline & Grit', icon: <Target size={24} />, description: 'Evaluate your consistency and work ethic.', difficulty: 'Hard' },
  { id: 'emotions', title: 'Emotional Intelligence', icon: <Heart size={24} />, description: 'Test your empathy and stress management.', difficulty: 'Hard' },
  { id: 'professionalism', title: 'Professionalism', icon: <Briefcase size={24} />, description: 'Measure your ethics and workplace conduct.', difficulty: 'Medium' }
];

const questions: Record<string, string[]> = {
  personality: [
    "Tell me about a time you had to work with someone whose personality was very different from yours.",
    "How do you handle constructive criticism from a peer?",
    "What are three words your teammates would use to describe you, and why?",
    "Describe a situation where you had to adapt to a major change in your work environment."
  ],
  discipline: [
    "Describe a long-term project you completed. How did you stay motivated until the end?",
    "Tell me about a time you failed to meet a deadline. What did you learn?",
    "How do you prioritize your tasks when everything seems urgent?",
    "Give an example of a time you went above and beyond your basic job requirements."
  ],
  emotions: [
    "Tell me about a time you were under a lot of pressure. How did you handle it?",
    "Describe a situation where you had to deliver bad news to a teammate or client.",
    "How do you react when a project you've worked hard on is suddenly cancelled?",
    "Tell me about a time you had a conflict with a coworker. How did you resolve it?"
  ],
  professionalism: [
    "What does 'professionalism' mean to you in a remote work environment?",
    "Tell me about a time you faced an ethical dilemma at work.",
    "How do you handle a situation where you disagree with a company policy?",
    "Describe a time you had to represent your company in a difficult situation."
  ]
};

export const PracticeView = ({ user, setView, refreshSessions }: { user: User, setView: (v: ViewType) => void, refreshSessions: () => void }) => {
  const [state, setState] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [timer, setTimer] = useState(120);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [micError, setMicError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(d => {
          if (d >= 90) {
            stopRecording();
            return 90;
          }
          return d + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    setMicError(null);
    setAudioChunks([]);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError("Your browser does not support audio recording. Please use a modern browser like Chrome or Firefox.");
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setMicError("MediaRecorder API is not supported in your browser. Please use a modern browser.");
      return;
    }

    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted.");
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/aac')) {
        mimeType = 'audio/aac';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        setAudioChunks(chunks);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Optional: create a local URL to play back if needed
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError("Microphone access denied. Please check your browser settings or try opening the app in a new tab using the 'Open in new tab' button in the top right.");
      } else {
        setMicError("Could not access microphone. Please ensure it's connected and not in use by another app.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setActiveQuestion(questions[catId]?.[0] || "Tell me about yourself.");
    setState('B');
  };

  const handleSubmit = async () => {
    setState('C');
    
    let audioData: { data: string; mimeType: string } | undefined;
    
    if (audioChunks.length > 0) {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(blob);
      const base64 = await base64Promise;
      audioData = { data: base64, mimeType: 'audio/webm' };
    }

    try {
      setAnalysisError(null);
      const result = await generateFeedback(response, activeQuestion, user.isPro, audioData);
      setFeedback(result);
      
      const session: InterviewSession = {
        id: Math.random().toString(36).substr(2, 9),
        category: selectedCategory || 'general',
        question: activeQuestion,
        userResponse: response,
        audioBase64: audioData?.data,
        feedback: result,
        durationSeconds: recordingDuration,
        timestamp: new Date().toISOString()
      };
      
      StorageService.saveSession(session);
      refreshSessions();
      setState('D');
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setAnalysisError(error.message || "An unexpected error occurred during AI analysis.");
      setState('B'); // Go back to practice view so they can try again
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {state === 'A' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-3xl font-bold mb-2 font-display">Smart Questionnaires</h2>
          <p className="text-gray-400 mb-8">Select a behavioral module to test your core competencies.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {questionnaires.map((q) => (
              <button
                key={q.id}
                onClick={() => handleCategorySelect(q.id)}
                className="glass-card text-left hover:border-primary transition-all group p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    {q.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{q.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{q.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">4 Questions</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {state === 'B' && (
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <button onClick={() => setState('A')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
              <ChevronLeft size={16} /> Back
            </button>
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500">Questions</h3>
            {questions[selectedCategory!]?.map((q, i) => (
              <button 
                key={i}
                onClick={() => setActiveQuestion(q)}
                className={`w-full text-left p-4 rounded-xl text-sm transition-all ${activeQuestion === q ? 'bg-primary/20 border border-primary' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card">
              <div className="flex justify-between items-center mb-6">
                <div className={`text-2xl font-mono font-bold ${isRecording ? (recordingDuration >= 80 ? 'text-orange-500' : 'text-red-500 animate-pulse') : 'text-primary'}`}>
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                  {isRecording && <span className="text-xs ml-2 text-gray-500">/ 1:30</span>}
                </div>
                {isRecording && recordingDuration < 20 && (
                  <div className="text-xs text-red-400 font-bold animate-bounce">
                    Min 20s required: {20 - recordingDuration}s left
                  </div>
                )}
                {isRecording && recordingDuration >= 80 && (
                  <div className="text-xs text-orange-400 font-bold animate-pulse">
                    Approaching limit: {90 - recordingDuration}s left
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-8">{activeQuestion}</h2>
              
              {analysisError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                  <AlertTriangle size={18} />
                  <div>
                    <p className="font-bold">Analysis Failed</p>
                    <p>{analysisError}</p>
                  </div>
                </div>
              )}

              {user.preference === 'video' ? (
                <div className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group opacity-50">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Camera size={48} className="text-white/20 mb-4" />
                  <p className="text-gray-400 font-bold relative z-10">
                    Video Interview Mode
                  </p>
                  <p className="text-xs text-gray-500 relative z-10">(Disabled - Coming Soon)</p>
                </div>
              ) : (
                <div className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-primary/20 text-primary'}`}>
                    <Mic size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{isRecording ? 'Recording in Progress...' : 'Ready to Record'}</h3>
                  {micError ? (
                    <div className="space-y-4">
                      <p className="text-red-400 text-sm max-w-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {micError}
                      </p>
                      <button 
                        onClick={startRecording}
                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm max-w-xs">
                      {isRecording ? 'Speak clearly into your microphone. Minimum 20 seconds required.' : 'Click the microphone button below to start your voice response.'}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-3">
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white/10 hover:bg-white/20'}`}
                    title={isRecording ? "Stop Recording" : "Start Recording"}
                  >
                    <Mic size={24} />
                  </button>
                  <button 
                    disabled
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white/5 text-gray-600 cursor-not-allowed"
                    title="Video Input (Disabled)"
                  >
                    <Video size={24} />
                  </button>
                </div>
                <button 
                  disabled={
                    (user.preference === 'voice' && (isRecording || recordingDuration < 20 || recordingDuration > 90)) ||
                    (user.preference === 'video')
                  }
                  onClick={handleSubmit}
                  className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {user.preference === 'video' ? 'Finish Interview' : 'Submit Answer'} <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {state === 'C' && (
        <div className="fixed inset-0 bg-secondary/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6">
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-8">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5 }}
            />
          </div>
          <motion.div
            key={Math.floor(Date.now() / 1000) % 3}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-xl font-bold mb-2">Nudge AI is analyzing your response...</h3>
            <p className="text-gray-400 italic">
              {["Identifying STAR components...", "Analyzing vocal tone and energy...", "Generating recruiter perspective...", "Transcribing your response..."][Math.floor(Date.now() / 1000) % 4]}
            </p>
          </motion.div>
        </div>
      )}

      {state === 'D' && feedback && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold font-display">Analysis Results</h2>
            <div className="flex gap-4">
              <button onClick={() => setState('A')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                <RotateCcw size={18} /> Practice Again
              </button>
              <button onClick={() => setView('dashboard')} className="bg-primary px-6 py-2 rounded-full font-bold">
                Dashboard
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card text-center py-12">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * feedback.overallScore) / 100} className="text-primary" />
                  </svg>
                  <span className="absolute text-3xl font-bold">{feedback.overallScore}%</span>
                </div>
                <h3 className="text-xl font-bold">Overall Score</h3>
                <div className="mt-2 text-xs bg-white/5 inline-block px-2 py-1 rounded text-gray-500">AI Analysis</div>
              </div>

              <div className="glass-card space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-gray-500">Core Metrics</h4>
                {['Clarity', 'Confidence', 'Impact'].map((m) => (
                  <div key={m}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{m}</span>
                      <span>{feedback[m.toLowerCase() as keyof FeedbackResult] as number}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${feedback[m.toLowerCase() as keyof FeedbackResult]}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Premium Metrics */}
              <div className="glass-card space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-gray-500">Voice Analysis</h4>
                  {!user.isPro && <Lock size={12} className="text-primary" />}
                </div>
                
                <div className={!user.isPro ? "blur-[2px] select-none opacity-50" : ""}>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fluency (Stutter Score)</span>
                      <span>{feedback.stutterScore || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${feedback.stutterScore || 0}%` }} />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 bg-white/5 p-3 rounded-lg italic">
                    {feedback.toneAnalysis || "No tone analysis available."}
                  </div>
                </div>
                
                {!user.isPro && (
                  <button className="w-full py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all">
                    Upgrade to Unlock Detailed Voice Analysis
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {!user.isPro ? (
                <div className="space-y-6">
                  {/* Generic Feedback for Free Users */}
                  <div className="glass-card bg-primary/5 border-primary/20">
                    <h3 className="text-xl font-bold mb-4">AI Feedback Summary</h3>
                    <p className="text-gray-300 leading-relaxed italic">"{feedback.genericFeedback || "Good effort! Practice more to get detailed insights."}"</p>
                  </div>

                  <div className="relative">
                    <div className="glass-card blur-md select-none pointer-events-none opacity-50">
                      <h3 className="text-xl font-bold mb-4">STAR Breakdown</h3>
                      <div className="space-y-4">
                        {['Situation', 'Task', 'Action', 'Result'].map(s => (
                          <div key={s} className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="font-bold mb-2">{s}</div>
                            <div className="h-4 bg-white/10 rounded w-full mb-2" />
                            <div className="h-4 bg-white/10 rounded w-2/3" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
                      <Lock size={48} className="text-primary mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Unlock Pro Feedback</h3>
                      <p className="text-gray-400 mb-6 max-w-xs">Get detailed STAR breakdown, recruiter perspective, and AI-rewritten answers.</p>
                      <button className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2">
                        Upgrade to Pro <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="glass-card">
                    <h3 className="text-xl font-bold mb-6">STAR Breakdown</h3>
                    <div className="space-y-4">
                      {Object.entries(feedback.starBreakdown).map(([key, value]) => {
                        const val = value as { present: boolean; excerpt: string; suggestion: string };
                        return (
                          <div key={key} className={`p-4 rounded-xl border ${val.present ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold capitalize">{key}</span>
                              {val.present ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                            </div>
                            <p className="text-sm text-gray-300 italic mb-2">"{val.excerpt}"</p>
                            <p className="text-xs text-gray-500">Tip: {val.suggestion}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="glass-card bg-primary/5 border-primary/20">
                    <h3 className="text-xl font-bold mb-4">Recruiter Perspective</h3>
                    <p className="text-gray-300 leading-relaxed italic">"{feedback.recruiterPerspective}"</p>
                  </div>
                  <div className="glass-card">
                    <h3 className="text-xl font-bold mb-4">AI Rewritten Answer</h3>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 font-mono text-sm text-primary">
                      {feedback.rewrittenAnswer}
                    </div>
                  </div>
                  <div className="glass-card">
                    <h3 className="text-xl font-bold mb-4">Your Transcription</h3>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-sm text-gray-400">
                      {feedback.transcription || "No transcription available."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
