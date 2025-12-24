import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { Arena } from './components/Arena';
import { ResultModal } from './components/ResultModal';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { ChallengeNotification } from './components/ChallengeNotification';
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
  submitDuelSolution
} from './services/firestore';
import { compareSolutions } from './services/geminiService';
import { signOut } from 'firebase/auth';
import { auth } from './services/firebase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'lobby' | 'profile' | 'arena'>('lobby');
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);
  const [scheduledChallenges, setScheduledChallenges] = useState<Challenge[]>([]);
  const [winLossNotification, setWinLossNotification] = useState<string | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

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
    startMatchmaking,
    startDuel,
    resetGame
  } = useGameEngine();

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

      // Auto-join if game is in_progress
      const activeGame = challenges.find(c => c.status === 'in_progress');
      
      if (activeGame && gameState === GameState.IDLE) {
         const isCreator = activeGame.fromId === currentUser.uid;
         const opponentName = isCreator ? activeGame.toName : activeGame.fromName;
         const opponentAvatar = isCreator ? activeGame.toAvatar : activeGame.fromAvatar; 
         // Fallback for avatar if toAvatar not yet saved in older records
         const finalOpponentAvatar = opponentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${isCreator ? activeGame.toId : activeGame.fromId}`;
         const opponentId = isCreator ? activeGame.toId : activeGame.fromId;

         setActiveChallengeId(activeGame.id);
         setView('arena');
         if (activeGame.problem) {
             startDuel(activeGame.problem, {
                name: opponentName,
                avatar: finalOpponentAvatar, 
                id: opponentId
             });
         }
      } else if (activeGame && (gameState === GameState.PLAYING || gameState === GameState.WAITING_FOR_OPPONENT) && activeChallengeId !== activeGame.id) {
         setActiveChallengeId(activeGame.id);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid, gameState, activeChallengeId, startDuel]); 

  // 3. Listen to Active Duel Updates (Code Submission, Winner detection)
  useEffect(() => {
    if (!activeChallengeId || !currentUser || !problem) return;

    const unsubscribe = subscribeToActiveDuel(activeChallengeId, async (challenge) => {
      // A. Check for Winner (Game Over)
      if (challenge.status === 'completed' && challenge.winnerId) {
        if (gameState !== GameState.FINISHED) {
            setGameState(GameState.FINISHED);
            
            const isWin = challenge.winnerId === currentUser.uid;
            const isDraw = challenge.winnerId === 'DRAW';
            
            // Get opponent details
            const isCreatorForCode = challenge.fromId === currentUser.uid;
            const opponentCode = isCreatorForCode ? challenge.toCode : challenge.fromCode;
            const opponentName = isCreatorForCode ? challenge.toName : challenge.fromName;
            const opponentAvatar = isCreatorForCode ? (challenge.toAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${challenge.toId}`) : challenge.fromAvatar;

            if (isDraw) {
               setResult({
                 winnerId: null,
                 message: "It's a draw! Both solutions were evaluated equally.",
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
                message: "Victory! The AI judge determined your code was superior.",
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
                message: "Defeat. The AI judge determined the opponent's code was better.",
                scoreChange: -15,
                aiReason: challenge.winReason,
                opponentCode: opponentCode,
                opponentName: opponentName,
                opponentAvatar: opponentAvatar
              });
            }

            // Update stats locally
            if (!isDraw) updateUserGameStats(currentUser.uid, isWin ? 'win' : 'loss');
        }
        return;
      }

      // B. Update Opponent Status based on Firestore
      const isCreator = challenge.fromId === currentUser.uid;
      const opponentCode = isCreator ? challenge.toCode : challenge.fromCode;
      
      if (opponentCode && opponent.status !== 'submitted') {
          setOpponent(prev => ({ ...prev, status: 'submitted' }));
      }

      // C. JUDGING TRIGGER: If both submitted and no winner yet
      if (challenge.fromCode && challenge.toCode && !challenge.winnerId && gameState !== GameState.EVALUATING) {
          // Both have submitted.
          setGameState(GameState.EVALUATING);
          
          if (isCreator) {
              console.log("Both submitted. I am creator. Starting Judge...");
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


  // 4. Background Loop: Check for Timeouts
  useEffect(() => {
    if (!currentUser?.uid || scheduledChallenges.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      scheduledChallenges.forEach(async (challenge) => {
         // Auto-start check
         if (challenge.status === 'accepted' && challenge.fromCheckedIn && challenge.toCheckedIn) {
            if (challenge.fromId === currentUser.uid) {
               await respondToChallenge(challenge.id, 'in_progress');
            }
         }

         // Timeout check
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

  const handleNavigate = (newView: 'lobby' | 'profile') => {
    if (gameState === GameState.IDLE || gameState === GameState.FINISHED) {
      setView(newView);
    }
  };

  const handleLogout = async () => {
    if (currentUser?.uid) {
      await updateUserProfile(currentUser.uid, { status: 'offline' });
    }
    await signOut(auth);
    setCurrentUser(null);
    setView('lobby');
    resetGame();
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    const challenge = incomingChallenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.problem) return;
    
    await respondToChallenge(challengeId, 'accepted');
    
    if (!challenge.scheduledTime) {
        setIncomingChallenges(prev => prev.filter(c => c.id !== challengeId));
        await respondToChallenge(challengeId, 'in_progress');
    } else {
        setIncomingChallenges(prev => prev.filter(c => c.id !== challengeId));
        alert(`Duel accepted! Join the arena at ${new Date(challenge.scheduledTime).toLocaleTimeString()}.`);
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
    
    // 1. Change Local State to Waiting
    setGameState(GameState.WAITING_FOR_OPPONENT);
    setUser(prev => ({ ...prev, status: 'submitted' }));
    
    // 2. Upload Code to Firestore
    const isCreator = scheduledChallenges.find(c => c.id === activeChallengeId)?.fromId === currentUser.uid;
    await submitDuelSolution(activeChallengeId, isCreator, code);
  };

  const handleForfeit = async () => {
    if (!activeChallengeId || !currentUser) return;
    // I Lose. Opponent Wins.
    const opponentId = opponent.id;
    await completeDuel(activeChallengeId, opponentId, currentUser.uid);
  };

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
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
          onFindMatch={startMatchmaking} 
          isFinding={gameState === GameState.MATCHMAKING} 
        />
      )}

      {view === 'profile' && (
        <Profile currentUser={currentUser} onUpdateUser={setCurrentUser} />
      )}

      {view === 'arena' && problem && (
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