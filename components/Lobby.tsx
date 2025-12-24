import React from 'react';
import { Sword, Zap, Brain, Shield } from 'lucide-react';
import { Difficulty, Language } from '../types';

interface LobbyProps {
  onFindMatch: (difficulty: Difficulty, language: Language) => void;
  isFinding: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({ onFindMatch, isFinding }) => {
  const [selectedDiff, setSelectedDiff] = React.useState<Difficulty>(Difficulty.EASY);
  const [selectedLang, setSelectedLang] = React.useState<Language>(Language.JAVASCRIPT);

  const difficulties = [
    {
      id: Difficulty.EASY,
      name: 'Easy',
      icon: Zap,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/20',
      desc: 'Warmup problems. 5-10 mins.'
    },
    {
      id: Difficulty.MEDIUM,
      name: 'Medium',
      icon: Brain,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20',
      desc: 'Standard interview questions. 15-20 mins.'
    },
    {
      id: Difficulty.HARD,
      name: 'Hard',
      icon: Shield,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
      desc: 'Complex algorithms. 30+ mins.'
    }
  ];

  const languages = [
    { id: Language.JAVASCRIPT, name: 'JavaScript' },
    { id: Language.PYTHON, name: 'Python 3' },
    { id: Language.C, name: 'C' },
    { id: Language.CPP, name: 'C++' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 animate-in fade-in duration-700">
      <div className="max-w-2xl w-full space-y-8 text-center">
        
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-full mb-4">
            <Sword className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Ready to <span className="text-brand-400">Duel</span>?
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto">
            Select your language and difficulty to match against a real opponent.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-dark-surface p-1 rounded-lg border border-dark-border inline-flex">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${selectedLang === lang.id 
                    ? 'bg-brand-600 text-white shadow-lg' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}
                `}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficulties.map((diff) => {
            const Icon = diff.icon;
            const isSelected = selectedDiff === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => setSelectedDiff(diff.id)}
                disabled={isFinding}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200 text-left
                  ${isSelected ? `${diff.border} ${diff.bg}` : 'border-dark-border bg-dark-surface hover:border-zinc-600'}
                  ${isFinding ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className={`w-8 h-8 mb-4 ${diff.color}`} />
                <h3 className="text-lg font-bold text-white mb-1">{diff.name}</h3>
                <p className="text-xs text-zinc-400">{diff.desc}</p>
                
                {isSelected && (
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onFindMatch(selectedDiff, selectedLang)}
          disabled={isFinding}
          className={`
            w-full md:w-auto px-12 py-4 rounded-full font-bold text-lg tracking-wide transition-all duration-300
            ${isFinding 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg hover:shadow-brand-500/25 transform hover:-translate-y-1'
            }
          `}
        >
          {isFinding ? (
            <span className="flex items-center gap-3">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              FINDING PLAYER...
            </span>
          ) : (
            'FIND MATCH'
          )}
        </button>
      </div>
    </div>
  );
};
