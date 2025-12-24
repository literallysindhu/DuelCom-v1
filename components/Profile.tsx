import React, { useState, useEffect } from 'react';
import { User, Trophy, XCircle, Edit2, Check, Search, Sword, CalendarClock, Trash2, AlertTriangle } from 'lucide-react';
import { UserProfile, Difficulty, Language } from '../types';
import { getAllUsers, updateUserProfile, sendChallenge, updateChallengeProblem, deleteUserProfile } from '../services/firestore';
import { generateProblem } from '../services/geminiService';
import { auth } from '../services/firebase';
import { deleteUser } from 'firebase/auth';

interface ProfileProps {
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpponent, setSelectedOpponent] = useState<UserProfile | null>(null);
  
  // Duel settings
  const [duelDiff, setDuelDiff] = useState<Difficulty>(Difficulty.EASY);
  const [duelLang, setDuelLang] = useState<Language>(Language.JAVASCRIPT);
  const [scheduledTime, setScheduledTime] = useState<string>(''); // ISO string from input
  const [sendingChallenge, setSendingChallenge] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users.filter(u => u.uid !== currentUser.uid));
      } catch (e) {
        console.error("Error fetching users:", e);
      }
    };
    if (currentUser?.uid) {
      fetchUsers();
    }
  }, [currentUser.uid]);

  const handleSaveProfile = async () => {
    if (!currentUser.uid) {
      alert("Error: User ID is missing. Please refresh the page and try again.");
      return;
    }

    try {
      const updates = { 
        bio: bio || '', 
        avatar: avatar || '',
        displayName: displayName || 'User'
      };
      await updateUserProfile(currentUser.uid, updates);
      onUpdateUser({ ...currentUser, ...updates });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleSendDuel = async () => {
    if (!selectedOpponent) return;
    setSendingChallenge(true);
    try {
      // Parse scheduled time if set
      let timestamp = undefined;
      if (scheduledTime) {
        timestamp = new Date(scheduledTime).getTime();
        if (timestamp < Date.now()) {
          alert("Scheduled time must be in the future.");
          setSendingChallenge(false);
          return;
        }
      }

      // Ensure we are passing clean objects
      const opponentData = {
         uid: selectedOpponent.uid,
         displayName: selectedOpponent.displayName,
         avatar: selectedOpponent.avatar
      } as UserProfile;

      const myData = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar
      } as UserProfile;

      // Optimistic Send: Send immediately with null problem
      const { id } = await sendChallenge(
        myData, 
        opponentData, 
        duelDiff, 
        duelLang, 
        null,
        timestamp
      );
      
      // Background Generation: Generate problem and update challenge
      generateProblem(duelDiff, duelLang).then(problem => {
          updateChallengeProblem(id, problem).catch(e => console.error("Profile: Failed to update problem", e));
      });

      alert(timestamp 
        ? `Scheduled duel request sent to ${selectedOpponent.displayName}!`
        : `Instant duel request sent to ${selectedOpponent.displayName}!`
      );
      setSelectedOpponent(null);
      setScheduledTime('');
    } catch (error) {
      console.error("Failed to send duel", error);
      alert("Failed to send duel request.");
    } finally {
      setSendingChallenge(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete my account") return;
    setIsDeleting(true);

    try {
        // 1. Delete User Data from Firestore
        await deleteUserProfile(currentUser.uid);

        // 2. Delete Authentication Account
        if (auth.currentUser) {
            await deleteUser(auth.currentUser);
        }
        // App will handle the redirect via auth state listener
    } catch (error: any) {
        console.error("Error deleting account:", error);
        setIsDeleting(false);
        if (error.code === 'auth/requires-recent-login') {
            alert("Security Alert: You need to re-login recently to delete your account. Please logout and login again, then try deleting.");
        } else {
            alert("Failed to delete account. Please try again.");
        }
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
      
      {/* Left Column: My Profile */}
      <div className="flex flex-col gap-6">
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 h-fit">
            <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <User className="w-6 h-6 text-brand-400" />
                My Profile
            </h2>
            {!isEditing ? (
                <button 
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-dark-bg rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                <Edit2 className="w-5 h-5" />
                </button>
            ) : (
                <div className="flex gap-2">
                <button 
                    onClick={() => { 
                    setIsEditing(false); 
                    setBio(currentUser.bio || ''); 
                    setAvatar(currentUser.avatar || ''); 
                    setDisplayName(currentUser.displayName || '');
                    }}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                >
                    <XCircle className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleSaveProfile}
                    className="p-2 hover:bg-green-500/10 rounded-lg text-green-400 transition-colors"
                >
                    <Check className="w-5 h-5" />
                </button>
                </div>
            )}
            </div>

            <div className="flex flex-col items-center mb-8">
            <div className="relative group">
                <img 
                src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`}
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-brand-500 mb-4 object-cover"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`;
                    if (target.src !== fallback) {
                        target.src = fallback;
                    }
                }}
                />
                {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white px-2 text-center">Enter URL below</span>
                </div>
                )}
            </div>
            
            {isEditing ? (
                <div className="w-full space-y-2 mb-4">
                    <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Username"
                    className="w-full text-center text-xl font-bold text-white bg-dark-bg border border-dark-border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
                <input 
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Avatar URL"
                    className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-zinc-300 focus:border-brand-500 focus:outline-none"
                />
                </div>
            ) : (
                <>
                <h3 className="text-xl font-bold text-white">{currentUser.displayName}</h3>
                </>
            )}
            <p className="text-zinc-500 text-sm">{currentUser.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-dark-bg rounded-xl p-4 text-center border border-dark-border">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Rating</div>
                <div className="text-2xl font-bold text-brand-400">{currentUser.rating}</div>
            </div>
            <div className="bg-dark-bg rounded-xl p-4 text-center border border-dark-border">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Wins</div>
                <div className="text-2xl font-bold text-green-400">{currentUser.wins}</div>
            </div>
            <div className="bg-dark-bg rounded-xl p-4 text-center border border-dark-border">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Losses</div>
                <div className="text-2xl font-bold text-red-400">{currentUser.losses}</div>
            </div>
            </div>

            <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bio</label>
            {isEditing ? (
                <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-32 bg-dark-bg border border-dark-border rounded-lg p-3 text-zinc-300 focus:border-brand-500 focus:outline-none resize-none"
                />
            ) : (
                <p className="text-zinc-300 bg-dark-bg/50 p-4 rounded-lg border border-dark-border min-h-[5rem] whitespace-pre-line">
                {currentUser.bio || "No bio set."}
                </p>
            )}
            </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-dark-surface border border-red-500/20 rounded-xl p-6">
            <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
                Permanently delete your account and all game history. This action cannot be undone.
            </p>
            <button 
                onClick={() => {
                    setDeleteConfirmation('');
                    setShowDeleteModal(true);
                }}
                className="text-red-400 hover:text-white border border-red-500/30 hover:bg-red-500 hover:border-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
                <Trash2 className="w-4 h-4" /> Delete Account
            </button>
        </div>
      </div>

      {/* Right Column: Find Opponents */}
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 h-[600px] flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Find Opponents
        </h2>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredUsers.length > 0 ? filteredUsers.map(user => (
            <div key={user.uid} className="bg-dark-bg border border-dark-border p-4 rounded-xl flex items-center justify-between group hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar} 
                  alt={user.displayName} 
                  className="w-10 h-10 rounded-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;
                    if (target.src !== fallback) {
                        target.src = fallback;
                    }
                  }}
                />
                <div>
                  <h4 className="font-bold text-white">{user.displayName}</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-brand-400">{user.rating} ELO</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-green-400">{user.wins}W</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOpponent(user)}
                className="bg-zinc-800 hover:bg-brand-600 text-white p-2 rounded-lg transition-colors"
              >
                <Sword className="w-4 h-4" />
              </button>
            </div>
          )) : (
            <div className="text-center text-zinc-500 mt-10">
              No opponents found.
            </div>
          )}
        </div>
      </div>

      {/* Duel Modal */}
      {selectedOpponent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Challenge {selectedOpponent.displayName}</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Difficulty</label>
                <div className="flex bg-dark-bg rounded-lg p-1 border border-dark-border">
                  {Object.values(Difficulty).map(d => (
                    <button
                      key={d}
                      onClick={() => setDuelDiff(d)}
                      className={`flex-1 py-2 text-sm rounded font-medium transition-colors ${duelDiff === d ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Language</label>
                <select 
                  value={duelLang}
                  onChange={(e) => setDuelLang(e.target.value as Language)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                >
                  {Object.values(Language).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  <span className="flex items-center gap-2"><CalendarClock className="w-3 h-3"/> Schedule Time (Optional)</span>
                </label>
                <input 
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-zinc-500 mt-1">Leave blank to duel immediately.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedOpponent(null)}
                className="flex-1 py-3 rounded-xl bg-dark-bg hover:bg-zinc-800 text-zinc-300 font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendDuel}
                disabled={sendingChallenge}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors flex justify-center items-center gap-2"
              >
                {sendingChallenge ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sword className="w-4 h-4" /> Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-surface border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-red-500/10 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Delete Account?</h3>
                    <p className="text-zinc-400 text-sm">
                        This action is irreversible. All your match history, rating, and profile data will be permanently removed.
                    </p>
                </div>
                
                <div className="mb-6">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        Type <span className="text-white select-none">delete my account</span> to confirm
                    </label>
                    <input 
                        type="text" 
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-red-500 focus:outline-none placeholder-zinc-700"
                        placeholder="delete my account"
                    />
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation.toLowerCase() !== "delete my account" || isDeleting}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {isDeleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "Delete Forever"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};