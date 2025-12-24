import React, { useState, useEffect } from 'react';
import { Clock, Play, AlertCircle, CheckCircle2, XCircle, Flag, Hourglass } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { Problem, PlayerState, GameState } from '../types';

interface ArenaProps {
  problem: Problem;
  gameState: GameState;
  userState: PlayerState;
  opponentState: PlayerState;
  timeLeft: number;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  currentCode: string;
  onForfeit: () => void;
}

export const Arena: React.FC<ArenaProps> = ({
  problem,
  gameState,
  userState,
  opponentState,
  timeLeft,
  onCodeChange,
  onSubmit,
  currentCode,
  onForfeit
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'examples'>('description');
  
  // Calculate minutes and seconds
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isLowTime = timeLeft < 60;
  
  const isWaitingForOpponent = gameState === GameState.WAITING_FOR_OPPONENT;
  const isEvaluating = gameState === GameState.EVALUATING;

  const handleSurrender = () => {
    if (window.confirm("Are you sure you want to surrender? This will be recorded as a loss.")) {
      onForfeit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden">
      {/* Game Header / HUD */}
      <header className="h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4 w-1/3">
          <div className="flex items-center gap-3">
            <img src={userState.avatar} alt="You" className="w-8 h-8 rounded-full border border-brand-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">You</span>
              <span className={`text-xs ${userState.status === 'submitted' ? 'text-blue-400' : 'text-zinc-500'}`}>
                {userState.status === 'submitted' ? 'Submitted' : 'Coding...'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-1/3">
          <div className={`
            font-mono text-2xl font-bold flex items-center gap-2
            ${isLowTime ? 'text-red-500 animate-pulse' : 'text-white'}
          `}>
            <Clock className="w-5 h-5" />
            {timeString}
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Time Remaining</div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/3">
           {/* Surrender Button */}
           <button 
             onClick={handleSurrender}
             className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
             title="Surrender / Exit Duel"
           >
             <Flag className="w-5 h-5" />
           </button>

          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-white">{opponentState.name}</span>
            <span className={`text-xs ${opponentState.status === 'submitted' ? 'text-green-400 font-bold' : 'text-zinc-500'}`}>
                {opponentState.status === 'submitted' ? 'Solution Ready' : 'Coding...'}
            </span>
          </div>
          <img src={opponentState.avatar} alt="Opponent" className="w-8 h-8 rounded-full border border-red-500" />
        </div>
      </header>

      {/* Main Content Split */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Waiting Overlay */}
        {(isWaitingForOpponent || isEvaluating) && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                {isEvaluating ? (
                    <>
                        <div className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin mb-6"></div>
                        <h2 className="text-3xl font-bold text-white mb-2">Judging Solutions</h2>
                        <p className="text-zinc-400">The AI is comparing code quality, efficiency, and correctness...</p>
                    </>
                ) : (
                    <>
                         <div className="bg-brand-500/20 p-6 rounded-full mb-6 animate-pulse">
                            <Hourglass className="w-12 h-12 text-brand-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Solution Submitted</h2>
                        <p className="text-zinc-400 max-w-md">
                            Your code is locked in. Waiting for <span className="text-white font-bold">{opponentState.name}</span> to submit their solution before evaluation begins.
                        </p>
                    </>
                )}
            </div>
        )}

        {/* Left Panel: Problem Statement */}
        <section className="w-full md:w-1/2 flex flex-col border-r border-dark-border bg-dark-bg">
          <div className="flex items-center gap-6 px-6 border-b border-dark-border h-12 shrink-0">
            <button
              onClick={() => setActiveTab('description')}
              className={`h-full text-sm font-medium border-b-2 transition-colors px-2 ${
                activeTab === 'description' ? 'border-brand-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`h-full text-sm font-medium border-b-2 transition-colors px-2 ${
                activeTab === 'examples' ? 'border-brand-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Examples
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <h2 className="text-2xl font-bold text-white mb-4">{problem.title}</h2>
            <div className="flex items-center gap-2 mb-6">
              <span className={`
                px-2 py-0.5 rounded text-xs font-medium border
                ${problem.difficulty === 'Easy' ? 'bg-green-400/10 text-green-400 border-green-400/20' : ''}
                ${problem.difficulty === 'Medium' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' : ''}
                ${problem.difficulty === 'Hard' ? 'bg-red-400/10 text-red-400 border-red-400/20' : ''}
              `}>
                {problem.difficulty}
              </span>
            </div>

            {activeTab === 'description' ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="whitespace-pre-line text-zinc-300 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-dark-surface rounded-lg p-4 border border-dark-border">
                    <h4 className="text-sm font-bold text-zinc-400 mb-2">Example {idx + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-zinc-500 block mb-1">Input:</span>
                        <code className="bg-black/30 px-2 py-1 rounded text-sm font-mono text-zinc-300 block w-full">
                          {ex.input}
                        </code>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 block mb-1">Output:</span>
                        <code className="bg-black/30 px-2 py-1 rounded text-sm font-mono text-brand-300 block w-full">
                          {ex.output}
                        </code>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-xs text-zinc-500 block mb-1">Explanation:</span>
                          <p className="text-sm text-zinc-400">{ex.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Panel: Code Editor */}
        <section className="w-full md:w-1/2 flex flex-col bg-[#0d0d0d] relative">
          <div className="flex-1 p-4 overflow-hidden">
             <CodeEditor 
               value={currentCode} 
               onChange={onCodeChange}
               disabled={gameState !== GameState.PLAYING}
             />
          </div>

          <div className="h-16 border-t border-dark-border bg-dark-surface flex items-center justify-between px-6 shrink-0">
             <div className="flex items-center gap-2">
                {/* Status messages can go here */}
             </div>

             <button
               onClick={onSubmit}
               disabled={gameState !== GameState.PLAYING}
               className={`
                 flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all
                 ${gameState === GameState.PLAYING 
                   ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg hover:shadow-brand-500/25' 
                   : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}
               `}
             >
               {gameState === GameState.PLAYING ? <><Play className="w-4 h-4 fill-current" /> SUBMIT SOLUTION</> : 'LOCKED'}
             </button>
          </div>
        </section>
      </main>
    </div>
  );
};