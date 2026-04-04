import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { User, InterviewSession } from '../types';
import { StorageService } from '../lib/storage';
import { Flame, Download, TrendingUp } from 'lucide-react';

export const ProgressView = ({ sessions }: { sessions: InterviewSession[] }) => {
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
    </div>
  );
};
