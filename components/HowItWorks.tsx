import React from 'react';
import { Sword, BrainCircuit, Zap, Trophy, ArrowLeft, AlertTriangle, Smartphone, Layout } from 'lucide-react';

interface HowItWorksProps {
  onBack: () => void;
  preLogin?: boolean;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBack, preLogin }) => {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back {preLogin ? 'to Entry' : 'to Lobby'}
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          Battle with <span className="text-brand-400">Code</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          DuelCom is a high-stakes, real-time 1v1 coding arena where your logic is matched against world-class challengers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Step 1 */}
        <div className="bg-dark-surface border border-dark-border p-8 rounded-2xl shadow-xl hover:border-brand-500/30 transition-colors">
          <div className="bg-brand-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Sword className="w-6 h-6 text-brand-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">1. Challenge</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Find an online player in the lobby and send a challenge. You can pick your preferred difficulty (Easy to Hard) and programming language.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-dark-surface border border-dark-border p-8 rounded-2xl shadow-xl hover:border-brand-500/30 transition-colors">
          <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">2. AI Problem Generation</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Gemini AI instantly crafts a unique algorithmic challenge tailored to your settings. No two duels are ever the same.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-dark-surface border border-dark-border p-8 rounded-2xl shadow-xl hover:border-brand-500/30 transition-colors">
          <div className="bg-yellow-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <BrainCircuit className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">3. Real-time Battle</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Enter the arena and code your solution. You can see your opponent's submission status in real-time. Speed and accuracy are both critical.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-dark-surface border border-dark-border p-8 rounded-2xl shadow-xl hover:border-brand-500/30 transition-colors">
          <div className="bg-green-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Trophy className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">4. AI Judging</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Once both players submit, our AI Judge evaluates correctness, time complexity, and code quality to declare a winner.
          </p>
        </div>
      </div>

      <div className="bg-yellow-500/5 border border-yellow-500/20 p-8 rounded-2xl mb-12">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-yellow-500">Critical Warnings</h3>
        </div>
        <ul className="space-y-4">
          <li className="flex gap-3 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0 mt-1.5"></div>
            <p className="text-zinc-300"><span className="text-white font-bold">Login Errors:</span> During early testing, we may wipe the database. If your login fails, your account might be gone—simply <span className="text-yellow-400 font-bold">Sign Up</span> again to continue.</p>
          </li>
          <li className="flex gap-3 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0 mt-1.5"></div>
            <p className="text-zinc-300"><span className="text-white font-bold">Mobile Restrictions:</span> To ensure a fair competitive experience, duels can only be initiated on <span className="text-white font-bold">Desktop Devices</span>. Mobile users can browse, but not battle.</p>
          </li>
          <li className="flex gap-3 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0 mt-1.5"></div>
            <p className="text-zinc-300"><span className="text-white font-bold">Inactivity:</span> If you are inactive for more than 10 minutes, you will be marked <span className="text-white font-bold">Offline</span> to prevent stale matchmaking.</p>
          </li>
        </ul>
      </div>

      <div className="text-center pb-12">
         <button 
           onClick={onBack}
           className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20"
         >
           {preLogin ? 'Go to Login / Sign Up' : 'Return to Arena'}
         </button>
      </div>
    </div>
  );
};