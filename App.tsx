import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { Arena } from './components/Arena';
import { ResultModal } from './components/ResultModal';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { NotificationsView } from './components/NotificationsView';
import { HowItWorks } from './components/HowItWorks';
import { ChallengeNotification } from './components/ChallengeNotification';
import { ConfigForm } from './components/ConfigForm';
import { useGameEngine } from './hooks/useGameEngine';
import { GameState, UserProfile, Challenge } from './types';
import { 
  subscribeToIncomingChallenges, 
  respondToChallenge, 
  updateUserProfile,
  subscribeToScheduledChallenges,
  checkInToChallenge,
  resolveDuelTimeout,
  subscribeToActiveDuel,
  completeDuel,
  updateUserGameStats,
  submitDuelSolution,
  syncUserProfile,
  setUserOnlineStatus,
  subscribeToUserProfile
} from './services/firestore';
import { compareSolutions } from './services/geminiService';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, isConfigured } from './services/firebase';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<'lobby' | 'profile' | 'arena' | 'notifications' | 'how-it-works'>('lobby');
  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);
  const [scheduledChallenges, setScheduledChallenges] = useState<Challenge[]>([]);
  const [winLossNotification, setWinLossNotification] = useState<string | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [showPreLoginInfo, setShowPreLoginInfo] = useState(false);
  
  const isIdleRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    gameState,
    setGameState,
    problem,
    timeLeft,
    user,
    setUser,
    opponent,
    setOpponent,
    result,
    setResult,
    code,
    setCode,
    startDuel,
    resetGame
  } = useGameEngine();

  // 0. Auth Persistence Listener
  useEffect(() => {
    if (!isConfigured || !auth) {
        setAuthLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          if (profile) {
            setCurrentUser(profile);
          } else {
            await signOut(auth);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 0.5. Visibility & Inactivity Handler
  useEffect(() => {
    if (!currentUser?.uid) return;

    const resetIdleTimer = () => {
      if (isIdleRef.current) {
        // Just came back from being idle
        setUserOnlineStatus(currentUser.uid, 'online');
        isIdleRef.current = false;
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      
      idleTimerRef.current = setTimeout(() => {
        // User has been inactive for IDLE_TIMEOUT
        setUserOnlineStatus(currentUser.uid, 'offline');
        isIdleRef.current = true;
      }, IDLE_TIMEOUT);
    };

    const handleVisibilityChange = () => {
       if (!document.hidden) {
           setUserOnlineStatus(currentUser.uid, 'online');
           resetIdleTimer();
       } else {
           if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
       }
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(evt => {
      window.addEventListener(evt, resetIdleTimer);
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    setUserOnlineStatus(currentUser.uid, 'online');
    resetIdleTimer();

    const handleBeforeUnload = () => {
        setUserOnlineStatus(currentUser.uid, 'offline');
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        activityEvents.forEach(evt => {
          window.removeEventListener(evt, resetIdleTimer);
        });
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [currentUser?.uid]);

  // 1. Listen for Incoming Challenges
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToIncomingChallenges(currentUser.uid, setIncomingChallenges);
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // 2. Listen for Scheduled/Active Challenges
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToScheduledChallenges(currentUser.uid, (challenges) => {
      setScheduledChallenges(challenges);

      const activeGame = challenges.find(c => c.status === 'in_progress');
      
      if (activeGame) {
         const isCreator = activeGame.fromId === currentUser.uid;
         const opponentName = isCreator ? activeGame.toName : activeGame.fromName;
         const opponentId = isCreator ? activeGame.toId : activeGame.fromId;
         const opponentAvatar = isCreator ? activeGame.toAvatar : activeGame.fromAvatar; 
         const finalOpponentAvatar = opponentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponentId}`;

         if (gameState === GameState.IDLE) {
             setActiveChallengeId(activeGame.id);
             setView('arena');
         } else if (activeChallengeId !== activeGame.id) {
             setActiveChallengeId(activeGame.id);
         }

         if (activeGame.problem && !problem) {
             startDuel(activeGame.problem, {
                name: opponentName,
                avatar: finalOpponentAvatar, 
                id: opponentId
             });
         }
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid, gameState, activeChallengeId, startDuel, problem]); 

  // 3. Listen to Active Duel Updates
  useEffect(() => {
    if (!activeChallengeId || !currentUser || !problem) return;

    const unsubscribe = subscribeToActiveDuel(activeChallengeId, async (challenge) => {
      if (challenge.status === 'completed' && challenge.winnerId) {
        if (gameState !== GameState.FINISHED) {
            setGameState(GameState.FINISHED);
            
            const isWin = challenge.winnerId === currentUser.uid;
            const isDraw = challenge.winnerId === 'DRAW';
            
            const isCreatorForCode = challenge.fromId === currentUser.uid;
            const opponentCode = isCreatorForCode ? challenge.toCode : challenge.fromCode;
            const opponentName = isCreatorForCode ? challenge.toName : challenge.fromName;
            const opponentAvatar = isCreatorForCode ? (challenge.toAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${challenge.toId}`) : challenge.fromAvatar;

            let resultMessage = isWin ? "Victory! The AI judge determined your code was superior." : "Defeat. The AI judge determined the opponent's code was better.";
            
            if (challenge.winReason === 'Surrender' || challenge.winReason === 'Disconnect') {
                if (isWin) {
                    resultMessage = `${opponentName} forfeited :(`;
                } else {
                    resultMessage = "You forfeited the match.";
                }
            } else if (isDraw) {
                resultMessage = "It's a draw! Both solutions were evaluated equally.";
            }

            if (isDraw) {
               setResult({
                 winnerId: null,
                 message: resultMessage,
                 scoreChange: 0,
                 aiReason: challenge.winReason,
                 opponentCode: opponentCode,
                 opponentName: opponentName,
                 opponentAvatar: opponentAvatar
               });
            } else if (isWin) {
              setUser(prev => ({ ...prev, status: 'won' }));
              setOpponent(prev => ({ ...prev, status: 'lost' }));
              setResult({
                winnerId: currentUser.uid,
                message: resultMessage,
                scoreChange: 25,
                aiReason: challenge.winReason,
                opponentCode: opponentCode,
                opponentName: opponentName,
                opponentAvatar: opponentAvatar
               });
            } else {
              setUser(prev => ({ ...prev, status: 'lost' }));
              setOpponent(prev => ({ ...prev, status: 'won' }));
              setResult({
                winnerId: challenge.winnerId!, 
                message: resultMessage,
                scoreChange: -15,
                aiReason: challenge.winReason,
                opponentCode: opponentCode,
                opponentName: opponentName,
                opponentAvatar: opponentAvatar
               });
            }

            if (!isDraw) updateUserGameStats(currentUser.uid, isWin ? 'win' : 'loss');
        }
        return;
      }

      const isCreator = challenge.fromId === currentUser.uid;
      const opponentCode = isCreator ? challenge.toCode : challenge.fromCode;
      
      if (opponentCode && opponent.status !== 'submitted') {
          setOpponent(prev => ({ ...prev, status: 'submitted' }));
      }

      if (challenge.fromCode && challenge.toCode && !challenge.winnerId && gameState !== GameState.EVALUATING) {
          setGameState(GameState.EVALUATING);
          
          if (isCreator) {
              const comparison = await compareSolutions(
                  problem, 
                  challenge.fromCode, 
                  challenge.toCode,
                  challenge.fromName,
                  challenge.toName
              );
              
              let winnerId = 'DRAW';
              if (comparison.winner === 'A') winnerId = challenge.fromId;
              if (comparison.winner === 'B') winnerId = challenge.toId;
              
              const loserId = winnerId === challenge.fromId ? challenge.toId : challenge.fromId;
              
              await completeDuel(activeChallengeId, winnerId, loserId, comparison.reason);
          }
      }
    });

    return () => unsubscribe();
  }, [activeChallengeId, currentUser, gameState, problem, setGameState, setUser, setOpponent, setResult]);


  // 4. Background Monitor
  useEffect(() => {
      if (gameState !== GameState.PLAYING || !activeChallengeId || !opponent.id || !currentUser) return;

      const unsubscribeOpponent = subscribeToUserProfile(opponent.id, async (oppProfile) => {
          if (oppProfile.status === 'offline') {
              await completeDuel(activeChallengeId, currentUser.uid, opponent.id, 'Disconnect');
          }
      });

      return () => unsubscribeOpponent();
  }, [gameState, activeChallengeId, opponent.id, currentUser]);

  useEffect(() => {
    if (!currentUser?.uid || scheduledChallenges.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      scheduledChallenges.forEach(async (challenge) => {
         if (challenge.status === 'accepted' && challenge.fromCheckedIn && challenge.toCheckedIn) {
            if (challenge.fromId === currentUser.uid) {
               await respondToChallenge(challenge.id, 'in_progress');
            }
         }

         if (!challenge.scheduledTime || challenge.status !== 'accepted') return;
         const timeLimit = challenge.scheduledTime + (1 * 60 * 1000); 
         
         if (now > timeLimit) {
            const isCreator = challenge.fromId === currentUser.uid;
            const amICheckedIn = isCreator ? challenge.fromCheckedIn : challenge.toCheckedIn;
            const isOpponentCheckedIn = isCreator ? challenge.toCheckedIn : challenge.fromCheckedIn;

            if (amICheckedIn && !isOpponentCheckedIn) {
                await resolveDuelTimeout(challenge, currentUser.uid);
                updateUserGameStats(currentUser.uid, 'win');
                setWinLossNotification(`You won against ${isCreator ? challenge.toName : challenge.fromName} by forfeit!`);
            } else if (!amICheckedIn && !isOpponentCheckedIn && isCreator) {
               await respondToChallenge(challenge.id, 'expired');
            }
         }
      });
    }, 2000); 

    return () => clearInterval(interval);
  }, [currentUser?.uid, scheduledChallenges]);

  const handleNavigate = (newView: 'lobby' | 'profile' | 'notifications' | 'how-it-works') => {
    if (gameState === GameState.IDLE || gameState === GameState.FINISHED) {
      if (newView === 'profile') setTargetProfileId(null);
      setView(newView);
    }
  };

  const handleLogout = async () => {
    if (currentUser?.uid) {
      await updateUserProfile(currentUser.uid, { status: 'offline' });
    }
    await signOut(auth);
    setView('lobby');
    resetGame();
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    const challenge = incomingChallenges.find(c => c.id === challengeId);
    if (!challenge) return;
    setIncomingChallenges(prev => prev.filter(c => c.id !== challengeId));
    await respondToChallenge(challengeId, 'accepted');
    if (!challenge.scheduledTime) {
        await respondToChallenge(challengeId, 'in_progress');
    }
  };

  const handleRejectChallenge = async (challengeId: string) => {
    await respondToChallenge(challengeId, 'rejected');
    setIncomingChallenges(prev => prev.filter(c => c.id !== challengeId));
  };

  const handleJoinScheduled = async (challenge: Challenge) => {
      if (!currentUser) return;
      const isCreator = challenge.fromId === currentUser.uid;
      await checkInToChallenge(challenge.id, currentUser.uid, isCreator);
  };
  
  const handleReturnToLobby = async () => {
      resetGame();
      setView('lobby');
      setActiveChallengeId(null);
  };

  const handleUserSubmit = async () => {
    if (!activeChallengeId || !currentUser) return;
    setGameState(GameState.WAITING_FOR_OPPONENT);
    setUser(prev => ({ ...prev, status: 'submitted' }));
    const isCreator = scheduledChallenges.find(c => c.id === activeChallengeId)?.fromId === currentUser.uid;
    await submitDuelSolution(activeChallengeId, isCreator, code);
  };

  const handleForfeit = async () => {
    if (!activeChallengeId || !currentUser) return;
    const challenge = scheduledChallenges.find(c => c.id === activeChallengeId);
    let opponentId = opponent.id;
    if (challenge) {
        opponentId = challenge.fromId === currentUser.uid ? challenge.toId : challenge.fromId;
    }
    await completeDuel(activeChallengeId, opponentId, currentUser.uid, 'Surrender');
  };

  const handleViewProfile = (uid: string) => {
      setTargetProfileId(uid);
      setView('profile');
  };

  if (!isConfigured) return <ConfigForm />;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    if (showPreLoginInfo) {
      return (
        <div className="min-h-screen bg-dark-bg text-zinc-100 flex flex-col">
          <HowItWorks preLogin onBack={() => setShowPreLoginInfo(false)} />
        </div>
      );
    }
    return <Auth onLogin={setCurrentUser} onShowHowItWorks={() => setShowPreLoginInfo(true)} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-zinc-100 font-sans selection:bg-brand-500/30 flex flex-col">
      <Navbar onNavigate={handleNavigate} currentView={view} onLogout={handleLogout} />
      
      {winLossNotification && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-dark-surface border border-brand-500 text-white px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-top-5 flex items-center gap-4">
              <span className="font-bold">{winLossNotification}</span>
              <button onClick={() => setWinLossNotification(null)} className="text-zinc-400 hover:text-white">Close</button>
          </div>
      )}

      {view === 'lobby' && (
        <Lobby 
          currentUser={currentUser}
          onViewProfile={handleViewProfile}
        />
      )}

      {view === 'profile' && (
        <Profile 
            currentUser={currentUser} 
            onUpdateUser={setCurrentUser} 
            targetUserId={targetProfileId} 
            onBack={() => {
                setView('lobby');
                setTargetProfileId(null);
            }}
        />
      )}

      {view === 'notifications' && (
        <NotificationsView currentUser={currentUser} />
      )}

      {view === 'how-it-works' && (
        <HowItWorks onBack={() => setView('lobby')} />
      )}

      {view === 'arena' && (
        problem ? (
          <Arena 
            problem={problem}
            gameState={gameState}
            userState={{...user, name: currentUser.displayName, avatar: currentUser.avatar }}
            opponentState={opponent}
            timeLeft={timeLeft}
            onCodeChange={setCode}
            onSubmit={handleUserSubmit}
            currentCode={code}
            onForfeit={handleForfeit}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300">
             <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-8 h-8 rounded-full bg-dark-surface"></div>
                </div>
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Preparing Battle Arena</h2>
             <p className="text-zinc-400">Generative AI is crafting your challenge...</p>
             <button 
                onClick={handleForfeit}
                className="mt-6 text-sm text-red-400 hover:text-red-300 underline underline-offset-4 cursor-pointer"
             >
                Cancel & Forfeit
             </button>
          </div>
        )
      )}

      {gameState === GameState.FINISHED && result && currentUser && (
        <ResultModal 
          result={result} 
          userState={{...user, id: currentUser.uid, name: currentUser.displayName, avatar: currentUser.avatar }}
          onGoHome={handleReturnToLobby} 
        />
      )}

      <ChallengeNotification 
        challenges={incomingChallenges}
        scheduledChallenges={scheduledChallenges.filter(c => c.status === 'accepted')}
        currentUser={currentUser}
        onAccept={handleAcceptChallenge}
        onReject={handleRejectChallenge}
        onJoinScheduled={handleJoinScheduled}
      />
    </div>
  );
};

export default App;