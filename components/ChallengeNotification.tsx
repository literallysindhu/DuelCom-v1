import React, { useState, useEffect } from 'react';
import { Sword, X, Check, Calendar, AlertCircle } from 'lucide-react';
import { Challenge, UserProfile } from '../types';

interface ChallengeNotificationProps {
  challenges: Challenge[]; // Pending challenges
  scheduledChallenges: Challenge[]; // Accepted future challenges
  currentUser: UserProfile;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onJoinScheduled: (challenge: Challenge) => void;
}

export const ChallengeNotification: React.FC<ChallengeNotificationProps> = ({ 
  challenges, 
  scheduledChallenges, 
  currentUser,
  onAccept, 
  onReject,
  onJoinScheduled
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const getScheduledStatus = (challenge: Challenge) => {
    if (!challenge.scheduledTime) return null;
    const diff = challenge.scheduledTime - now;
    const isReady = diff <= 0;
    const isWarning = diff > 0 && diff <= 5 * 60 * 1000; // 5 mins before
    
    // Check if I have already checked in
    const amICreator = challenge.fromId === currentUser.uid;
    const amICheckedIn = amICreator ? challenge.fromCheckedIn : challenge.toCheckedIn;

    return { diff, isReady, isWarning, amICheckedIn };
  };

  if (challenges.length === 0 && scheduledChallenges.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-2">
      
      {/* Pending Invitations */}
      {challenges.map(challenge => (
        <div key={challenge.id} className="bg-dark-surface border border-brand-500/30 shadow-2xl p-4 rounded-xl w-80 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-brand-500/20 p-2 rounded-lg text-brand-400">
              <Sword className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Duel Request</h4>
              <p className="text-zinc-400 text-xs mt-1">
                <span className="text-white font-bold">{challenge.fromName}</span> challenges you to a <span className="text-brand-400">{challenge.difficulty}</span> match!
                {challenge.scheduledTime && (
                    <span className="block mt-1 text-yellow-400 font-mono">
                         @{new Date(challenge.scheduledTime).toLocaleString()}
                    </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onReject(challenge.id)}
              className="flex-1 py-2 bg-dark-bg hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-3 h-3" /> Decline
            </button>
            <button 
              onClick={() => onAccept(challenge.id)}
              className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-3 h-3" /> Accept
            </button>
          </div>
        </div>
      ))}

      {/* Scheduled / Active Duels */}
      {scheduledChallenges.map(challenge => {
         const status = getScheduledStatus(challenge);
         if (!status) return null;
         
         // Don't show if more than 30 mins away
         if (status.diff > 30 * 60 * 1000) return null;

         const isOpponentCheckedIn = (challenge.fromId === currentUser.uid) ? challenge.toCheckedIn : challenge.fromCheckedIn;

         return (
            <div key={challenge.id} className="bg-dark-surface border border-yellow-500/30 shadow-2xl p-4 rounded-xl w-80 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-start gap-3 mb-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                <h4 className="font-bold text-white text-sm">Upcoming Duel</h4>
                <p className="text-zinc-400 text-xs mt-1">
                    vs <span className="text-white font-bold">{challenge.fromId === currentUser.uid ? challenge.toName : challenge.fromName}</span>
                </p>
                <p className={`text-xs mt-1 font-mono font-bold ${status.isReady ? 'text-red-400 animate-pulse' : 'text-brand-400'}`}>
                    {status.isReady ? "DUEL STARTED!" : `Starts in ${Math.ceil(status.diff / 60000)} mins`}
                </p>
                </div>
            </div>
            
            {status.amICheckedIn ? (
                <div className="w-full py-2 bg-zinc-800/50 rounded-lg text-xs text-center text-zinc-400 border border-zinc-700">
                   {isOpponentCheckedIn ? "Starting..." : "Waiting for opponent..."}
                </div>
            ) : (
                <button 
                    onClick={() => onJoinScheduled(challenge)}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1
                        ${status.diff < 5 * 60 * 1000 
                            ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse-fast' 
                            : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'}
                    `}
                    disabled={status.diff >= 5 * 60 * 1000}
                >
                    {status.diff < 5 * 60 * 1000 ? "JOIN ARENA NOW" : "Wait to Join"}
                </button>
            )}
            </div>
         );
      })}
    </div>
  );
};