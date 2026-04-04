import { BrainCircuit, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-accent/30 border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Company */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit className="text-primary w-6 h-6" />
              <span className="text-xl font-bold font-display tracking-tight">
                Nudge<span className="text-primary">.ai</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Empowering the next generation of professionals with AI-driven interview coaching and behavioral skill development.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Github size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Mail size={20} /></a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">AI Interviewer</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">STAR Method Coach</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tone Analysis</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Interview Guide</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Behavioral Questions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {currentYear} Nudge.ai. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
