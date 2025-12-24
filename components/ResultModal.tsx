import React, { useState } from 'react';
import { Trophy, Frown, Timer, X, RefreshCw, Eye, BrainCircuit, FileCode, ArrowLeft, Swords } from 'lucide-react';
import { MatchResult, PlayerState } from '../types';
import { CodeEditor } from './CodeEditor';

interface ResultModalProps {
  result: MatchResult;
  onGoHome: () => void;
  userState: PlayerState;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onGoHome, userState }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const isWin = result.winnerId === userState.id;
  const isDraw = result.winnerId === null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`bg-dark-surface border border-dark-border rounded-2xl w-full p-8 shadow-2xl transform scale-100 transition-all ${showAnalysis ? 'max-w-4xl' : 'max-w-md'}`}>
        
        {!showAnalysis ? (
          <>
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${isWin ? 'bg-brand-500/20' : isDraw ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                {isWin ? (
                  <Trophy className="w-12 h-12 text-brand-400" />
                ) : isDraw ? (
                  <Timer className="w-12 h-12 text-yellow-400" />
                ) : (
                  <Frown className="w-12 h-12 text-red-400" />
                )}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-white mb-2">
              {isWin ? 'VICTORY!' : isDraw ? 'TIME\'S UP' : 'DEFEAT'}
            </h2>
            
            <p className="text-center text-zinc-400 mb-6">
              {result.message}
            </p>

            {/* Players Banner */}
            <div className="bg-dark-bg/50 rounded-lg p-3 mb-8 flex items-center justify-center gap-4 border border-dark-border">
                <div className="flex items-center gap-2">
                    <img src={userState.avatar} className="w-6 h-6 rounded-full" alt="You" />
                    <span className="text-sm font-bold text-white">You</span>
                </div>
                <span className="text-zinc-600 font-bold text-xs">VS</span>
                <div className="flex items-center gap-2">
                    {result.opponentAvatar && <img src={result.opponentAvatar} className="w-6 h-6 rounded-full" alt="Opponent" />}
                    <span className="text-sm font-bold text-white">{result.opponentName || 'Opponent'}</span>
                </div>
            </div>

            <div className="bg-dark-bg rounded-xl p-4 mb-8 flex justify-between items-center border border-dark-border">
              <div className="text-center">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Rating</div>
                <div className={`text-xl font-mono font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                  {isWin ? '+' : ''}{result.scoreChange}
                </div>
              </div>
              <div className="h-8 w-px bg-dark-border" />
              <div className="text-center">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</div>
                <div className="text-xl font-bold text-white">
                  {isWin ? 'SOLVED' : 'FAILED'}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {(result.aiReason || result.opponentCode) && (
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-zinc-700"
                >
                  <Eye className="w-4 h-4" />
                  VIEW MATCH ANALYSIS
                </button>
              )}

              <button
                onClick={onGoHome}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                RETURN TO LOBBY
              </button>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6 border-b border-dark-border pb-4">
              <button 
                onClick={() => setShowAnalysis(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Match Analysis
                <span className="text-sm font-normal text-zinc-500 ml-2">
                   (You vs {result.opponentName || 'Opponent'})
                </span>
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* AI Verdict */}
              {result.aiReason && (
                <div className="bg-dark-bg rounded-xl border border-brand-500/20 p-5">
                   <h3 className="flex items-center gap-2 font-bold text-white mb-3">
                     <BrainCircuit className="w-5 h-5 text-brand-400" />
                     AI Judge's Verdict
                   </h3>
                   <div className="prose prose-invert prose-sm max-w-none">
                     <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                       {result.aiReason}
                     </p>
                   </div>
                </div>
              )}

              {/* Opponent Code */}
              {result.opponentCode ? (
                <div className="space-y-3">
                   <h3 className="flex items-center gap-2 font-bold text-white">
                     <FileCode className="w-5 h-5 text-blue-400" />
                     {result.opponentName ? `${result.opponentName}'s Solution` : "Opponent's Solution"}
                   </h3>
                   <div className="h-[400px] border border-dark-border rounded-xl overflow-hidden shadow-inner">
                      <CodeEditor 
                        value={result.opponentCode} 
                        onChange={() => {}} 
                        disabled={true} 
                      />
                   </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-8 italic">
                  Opponent did not submit a solution.
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-dark-border mt-6">
               <button
                  onClick={onGoHome}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  RETURN TO LOBBY
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};