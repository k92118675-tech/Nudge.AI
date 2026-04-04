import { Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Pricing = ({ onUpgrade }: { onUpgrade?: () => void }) => {
  const tiers = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for getting started with AI practice.',
      features: [
        '4 Behavioral Questionnaires',
        'Basic AI Feedback Summary',
        'Performance Tracking',
        'Voice Recording Mode',
        'Community Access'
      ],
      buttonText: 'Current Plan',
      isPro: false
    },
    {
      name: 'Pro',
      price: '350',
      description: 'The ultimate toolkit for serious candidates.',
      features: [
        'Unlimited AI Analysis',
        'Detailed STAR Breakdown',
        'Voice Tone & Energy Analysis',
        'AI-Rewritten Answers',
        'Full Session History Playback',
        'Recruiter Perspective Insights',
        'Priority AI Processing'
      ],
      buttonText: 'Upgrade to Pro',
      isPro: true
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-6">
      {tiers.map((tier, idx) => (
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className={`relative glass-card p-8 flex flex-col ${tier.isPro ? 'border-primary/50 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]' : ''}`}
        >
          {tier.isPro && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-primary/20">
              <Sparkles size={10} /> Recommended
            </div>
          )}

          <div className="mb-8">
            <h3 className={`text-2xl font-bold mb-2 ${tier.isPro ? 'text-primary' : ''}`}>{tier.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold font-display">₹{tier.price}</span>
              <span className="text-gray-500 text-sm">/mo</span>
            </div>
            <p className="text-sm text-gray-400">{tier.description}</p>
          </div>

          <div className="space-y-4 mb-8 flex-grow">
            {tier.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className={`mt-1 p-0.5 rounded-full ${tier.isPro ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-500'}`}>
                  <Check size={12} />
                </div>
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onUpgrade}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              tier.isPro 
                ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tier.buttonText}
          </button>
        </motion.div>
      ))}
    </div>
  );
};
