import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, PlayerState, Problem, Difficulty, MatchResult, Language } from '../types';
import { generateProblem, judgeSubmission } from '../services/geminiService';

const MATCH_DURATION = 600; // 10 minutes in seconds

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
  const [code, setCode] = useState('');
  
  const [user, setUser] = useState<PlayerState>({
    id: 'user',
    name: 'You',
    avatar: '',
    status: 'idle',
    progress: 0
  });

  const [opponent, setOpponent] = useState<PlayerState>({
    id: 'opponent',
    name: 'Waiting...',
    avatar: '',
    status: 'idle',
    progress: 0
  });

  const [result, setResult] = useState<MatchResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Used for matchmaking only
  const startMatchmaking = useCallback(async (difficulty: Difficulty, language: Language) => {
    setGameState(GameState.MATCHMAKING);
    // Logic handled in App.tsx mainly now
  }, []);

  const startDuel = useCallback((newProblem: Problem, opponentProfile: { name: string, avatar: string, id: string }) => {
    setProblem(newProblem);
    setCode(newProblem.starterCode);
    
    setOpponent(prev => ({ 
      ...prev, 
      name: opponentProfile.name,
      avatar: opponentProfile.avatar,
      id: opponentProfile.id,
      status: 'coding', 
      progress: 0 
    }));
    
    setUser(prev => ({ ...prev, status: 'coding', progress: 0 }));
    setTimeLeft(MATCH_DURATION);
    setGameState(GameState.PLAYING);
  }, []);

  // Just evaluation logic, result handling is done in App.tsx
  const evaluateCode = async (): Promise<{ correct: boolean; feedback: string }> => {
    if (!problem) return { correct: false, feedback: "No problem loaded" };
    setGameState(GameState.EVALUATING);
    setUser(prev => ({ ...prev, status: 'submitted' }));

    const judgeResult = await judgeSubmission(problem, code);
    
    if (!judgeResult.correct) {
      // If incorrect, let them keep playing
      setGameState(GameState.PLAYING);
      setUser(prev => ({ ...prev, status: 'coding' }));
    }

    return judgeResult;
  };

  const setGameFinished = useCallback((winnerId: string | null, message: string) => {
    setGameState(GameState.FINISHED);
    if (timerRef.current) clearInterval(timerRef.current);

    // Determine result based on provided winnerId
    // Note: 'user' here refers to the local player ID set in App.tsx logic (usually we compare IDs)
    // But since this hook is generic, we rely on App to pass correct strings or handle visual state
  }, []);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer ran out handled by App.tsx observing this value or explicit call
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const resetGame = () => {
    setGameState(GameState.IDLE);
    setProblem(null);
    setResult(null);
    setUser(prev => ({ ...prev, status: 'idle', progress: 0 }));
    setOpponent(prev => ({ ...prev, name: 'Waiting...', status: 'idle', progress: 0 }));
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
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
    evaluateCode,
    resetGame,
  };
};