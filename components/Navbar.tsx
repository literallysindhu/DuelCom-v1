import React from 'react';
import { Terminal, Trophy, User, LogOut, Bell, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: 'lobby' | 'profile' | 'notifications' | 'how-it-works') => void;
  onLogout: () => void;
  currentView: 'lobby' | 'profile' | 'arena' | 'notifications' | 'how-it-works';
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onLogout, currentView }) => {
  return (
    <nav className="h-16 border-b border-dark-border bg-dark-bg/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => onNavigate('lobby')}
      >
        <div className="bg-brand-500 p-1.5 rounded-lg">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Duel<span className="text-brand-400">Com</span></span>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={() => onNavigate('how-it-works')}
          className={`flex items-center gap-2 transition-colors cursor-pointer ${
            currentView === 'how-it-works' ? 'text-brand-400' : 'text-zinc-400 hover:text-white'
          }`}
          title="How it Works"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium hidden md:inline">How it Works</span>
        </button>

        <button 
          onClick={() => onNavigate('notifications')}
          className={`flex items-center gap-2 transition-colors cursor-pointer ${
            currentView === 'notifications' ? 'text-brand-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium hidden md:inline">Notifications</span>
        </button>
        
        <button 
          onClick={() => onNavigate('profile')}
          className={`flex items-center gap-2 transition-colors cursor-pointer ${
            currentView === 'profile' ? 'text-brand-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium hidden md:inline">Profile</span>
        </button>

        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};