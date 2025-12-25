import React, { useState } from 'react';
import { Terminal, Lock, Mail, ArrowRight, CheckSquare, Square, AlertTriangle, HelpCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence, deleteUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { syncUserProfile } from '../services/firestore';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
  onShowHowItWorks: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onShowHowItWorks }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            await updateProfile(userCredential.user, {
                displayName: email.split('@')[0]
            });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const firebaseUser = userCredential.user;
      const profile = await syncUserProfile(firebaseUser);
      
      if (profile) {
        onLogin(profile);
      } else {
        await deleteUser(firebaseUser);
        setError('Account data missing (Database Wiped). Your account has been reset. Please Sign Up again.');
        setIsSignUp(true);
      }

    } catch (err: any) {
      console.error(err);
      let msg = 'Authentication failed';
      if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password';
      if (err.code === 'auth/user-not-found') msg = 'Account not found. Please Sign Up.';
      if (err.code === 'auth/email-already-in-use') msg = 'Email already registered';
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 flex-col">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-xl mb-4">
            <Terminal className="w-10 h-10 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Duel<span className="text-brand-400">Com</span>
          </h1>
          <p className="text-zinc-400 mt-2">
            {isSignUp ? 'Join the competitive arena' : 'Welcome back, challenger'}
          </p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setRememberMe(!rememberMe)}
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 text-brand-500" />
              ) : (
                <Square className="w-4 h-4 text-zinc-500" />
              )}
              <span className="text-sm text-zinc-300 select-none">Remember me for a week</span>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-6"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <div className="text-xs text-zinc-400 leading-relaxed">
                  <span className="font-bold text-yellow-500">Stability Note:</span> Due to the Pre-Alpha stage, if you experience login issues, your account may have been cleared in a database wipe. Please <span className="text-white font-bold">Sign Up</span> again.
              </div>
          </div>

          <p className="mt-8 text-center text-sm text-zinc-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-400 hover:text-brand-300 font-medium ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <button 
          onClick={onShowHowItWorks}
          className="mt-6 w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
        >
          <HelpCircle className="w-4 h-4" />
          How does DuelCom work?
        </button>
      </div>
    </div>
  );
};