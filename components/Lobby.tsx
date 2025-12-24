import React, { useState, useEffect, useRef } from 'react';
import { Search, Sword, User, Wifi, Trophy, X, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Difficulty, Language, UserProfile, Challenge } from '../types';
import { getAllUsers, sendChallenge, subscribeToSingleChallenge, respondToChallenge, updateChallengeProblem } from '../services/firestore';
import { generateProblem } from '../services/geminiService';

interface LobbyProps {
  currentUser: UserProfile;
}

export const Lobby: React.FC<LobbyProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // -- Challenge Configuration State --
  const [selectedOpponent, setSelectedOpponent] = useState<UserProfile | null>(null);
  const [duelDiff, setDuelDiff] = useState<Difficulty>(Difficulty.EASY);
  const [duelLang, setDuelLang] = useState<Language>(Language.JAVASCRIPT);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  
  // -- Sending & Waiting State --
  const [sending, setSending] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'waiting' | 'accepted' | 'rejected' | 'timeout' | 'offline_warning'>('idle');
  
  // -- Refs for timer management --
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        // Filter out self and sort by online status
        const filtered = allUsers
           .filter(u => u.uid !== currentUser.uid)
           .sort((a, b) => {
               if (a.status === 'online' && b.status !== 'online') return -1;
               if (a.status !== 'online' && b.status === 'online') return 1;
               return 0;
           });
        setUsers(filtered);
      } catch (e) {
        console.error("Failed to fetch users", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    
    // Refresh list every 15 seconds
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, [currentUser.uid]);

  // 2. Sender: Watch the active challenge for response
  useEffect(() => {
    if (!activeChallengeId) return;

    const unsubscribe = subscribeToSingleChallenge(activeChallengeId, (challenge) => {
        if (challenge.status === 'accepted') {
            setChallengeStatus('accepted');
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            // App.tsx handles the redirection to Arena via scheduledChallenges listener
        } else if (challenge.status === 'rejected') {
            setChallengeStatus('rejected');
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    });

    return () => {
        unsubscribe();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeChallengeId]);


  const handleChallengeClick = (opponent: UserProfile) => {
    // Check if offline
    if (opponent.status === 'offline') {
        setSelectedOpponent(opponent);
        setChallengeStatus('offline_warning');
        return;
    }
    
    setSelectedOpponent(opponent);
    setDuelDiff(Difficulty.EASY);
    setDuelLang(Language.JAVASCRIPT);
    setScheduledTime('');
    setChallengeStatus('idle');
  };

  const handleSendChallenge = async (forceSchedule: boolean = false) => {
    if (!selectedOpponent) return;
    setSending(true);

    try {
        // Prepare scheduled time
        let timestamp: number | undefined = undefined;
        if (scheduledTime) {
            timestamp = new Date(scheduledTime).getTime();
        } else if (forceSchedule) {
             // Default to 1 hour from now if forced to schedule without time picked (fallback)
             timestamp = Date.now() + 3600000; 
        }

        // Fast Send: Create challenge first without problem (optimistic UI)
        const { id } = await sendChallenge(
            currentUser, 
            selectedOpponent, 
            duelDiff, 
            duelLang, 
            null,
            timestamp
        );
        
        // Background Generation: Generate problem and update challenge silently
        generateProblem(duelDiff, duelLang).then(problem => {
             updateChallengeProblem(id, problem).catch(e => console.error("Problem update failed", e));
        });

        if (timestamp) {
            // If scheduled, we don't wait for immediate response
            alert(`Challenge scheduled with ${selectedOpponent.displayName}! Check notifications.`);
            resetModal();
        } else {
            // Immediate Duel: Start Waiting
            setActiveChallengeId(id);
            setChallengeStatus('waiting');
            
            // Start 30s Timeout
            timeoutRef.current = setTimeout(async () => {
                 setChallengeStatus('timeout');
                 await respondToChallenge(id, 'expired');
            }, 30000);
        }

    } catch (e) {
        console.error(e);
        alert("Failed to send challenge.");
        setSending(false);
    }
  };

  const resetModal = () => {
      setSelectedOpponent(null);
      setChallengeStatus('idle');
      setActiveChallengeId(null);
      setSending(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const filteredUsers = users.filter(u => 
    (u.displayName || 'Unknown').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Arena <span className="text-brand-400">Lobby</span>
          </h1>
          <p className="text-zinc-400 mt-1">
            Pick an opponent from the list below to start a duel.
          </p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full bg-dark-surface border border-dark-border rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none transition-colors shadow-lg"
          />
        </div>
      </div>

      {/* User Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredUsers.map(user => (
             <div key={user.uid} className="bg-dark-surface border border-dark-border rounded-xl p-5 hover:border-zinc-600 transition-all shadow-md group relative overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img 
                            src={user.avatar} 
                            alt={user.displayName} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-dark-border"
                             onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;
                                if (target.src !== fallback) target.src = fallback;
                             }}
                        />
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-dark-surface ${user.status === 'online' ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{user.displayName || 'Unknown User'}</h3>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                            <span className="flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-yellow-400" /> {user.wins || 0}
                            </span>
                             <span className="flex items-center gap-1">
                                <User className="w-3 h-3" /> {user.rating || 1200} ELO
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleChallengeClick(user)}
                        className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg transform transition-all hover:scale-105 active:scale-95"
                        title="Challenge Player"
                    >
                        <Sword className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Status Badge */}
                <div className="mt-4 flex items-center gap-2 text-xs">
                    {user.status === 'online' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                             <Wifi className="w-3 h-3" /> Online
                         </span>
                    ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-700/50 text-zinc-400 border border-zinc-700">
                             Offline
                         </span>
                    )}
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-surface rounded-2xl border border-dark-border border-dashed">
            <User className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No players found</h3>
            <p className="text-zinc-400 mt-2">Wait for others to join or refine your search.</p>
        </div>
      )}

      {/* -- ALL MODALS -- */}
      {selectedOpponent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-md w-full p-6 shadow-2xl transform scale-100 transition-all">
            
            {/* Header for all modal states */}
            <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-xl font-bold text-white">
                        {challengeStatus === 'offline_warning' ? 'Offline Opponent' : `Challenge ${selectedOpponent.displayName}`}
                    </h3>
                 </div>
                 {!sending && challengeStatus === 'idle' && (
                     <button onClick={resetModal} className="text-zinc-500 hover:text-white">
                         <X className="w-5 h-5" />
                     </button>
                 )}
            </div>

            {/* 1. Offline Warning State */}
            {challengeStatus === 'offline_warning' && (
                <div className="space-y-6">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                         <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0" />
                         <div>
                             <p className="text-white font-bold text-sm">This user is currently offline.</p>
                             <p className="text-zinc-400 text-xs mt-1">You cannot start an instant duel, but you can schedule one for later.</p>
                         </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Schedule Time</label>
                        <input 
                            type="datetime-local"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={resetModal} className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold">Exit</button>
                        <button 
                            onClick={() => handleSendChallenge(true)} 
                            className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold disabled:opacity-50"
                            disabled={!scheduledTime}
                        >
                            Schedule
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Configuration State (Idle) */}
            {challengeStatus === 'idle' && (
                <>
                <div className="space-y-4 mb-8">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Difficulty</label>
                    <div className="flex bg-dark-bg rounded-lg p-1 border border-dark-border">
                    {Object.values(Difficulty).map(d => (
                        <button
                        key={d}
                        onClick={() => setDuelDiff(d)}
                        className={`flex-1 py-2 text-sm rounded font-medium transition-colors ${duelDiff === d ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                        {d}
                        </button>
                    ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Language</label>
                    <select 
                    value={duelLang}
                    onChange={(e) => setDuelLang(e.target.value as Language)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none appearance-none cursor-pointer"
                    >
                    {Object.values(Language).map(l => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                    </select>
                </div>

                <div>
                     <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                         <span className="flex items-center gap-2"><Clock className="w-3 h-3"/> Schedule (Optional)</span>
                     </label>
                     <input 
                         type="datetime-local"
                         value={scheduledTime}
                         onChange={(e) => setScheduledTime(e.target.value)}
                         className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                         min={new Date().toISOString().slice(0, 16)}
                     />
                </div>
                </div>

                <button 
                    onClick={() => handleSendChallenge()}
                    disabled={sending}
                    className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all flex justify-center items-center gap-2 shadow-lg shadow-brand-500/20"
                >
                    {sending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                    <>
                        <Sword className="w-5 h-5" /> {scheduledTime ? 'SCHEDULE DUEL' : 'SEND CHALLENGE'}
                    </>
                    )}
                </button>
                </>
            )}

            {/* 3. Waiting / Response States */}
            {challengeStatus === 'waiting' && (
                <div className="text-center py-6">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin"></div>
                            <img src={selectedOpponent.avatar} className="absolute inset-0 w-16 h-16 rounded-full object-cover p-2" alt="opp" />
                        </div>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Waiting for response...</h4>
                    <p className="text-zinc-400 text-sm">The opponent has 30 seconds to accept.</p>
                </div>
            )}

            {challengeStatus === 'accepted' && (
                 <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Challenge Accepted!</h4>
                    <p className="text-zinc-400 text-sm">Entering the arena...</p>
                 </div>
            )}

            {challengeStatus === 'rejected' && (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Opponent Declined</h4>
                    <p className="text-zinc-400 text-sm mb-6">They might be busy. Try again later.</p>
                    <button onClick={resetModal} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold">
                        Close
                    </button>
                </div>
            )}

            {challengeStatus === 'timeout' && (
                 <div className="text-center py-6">
                    <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">No Response</h4>
                    <p className="text-zinc-400 text-sm mb-6">Your opponent did not respond in time.</p>
                    <button onClick={resetModal} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold">
                        Close
                    </button>
                </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};