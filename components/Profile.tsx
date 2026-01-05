import React, { useState, useEffect, useRef } from 'react';
// Added Loader2 to the lucide-react imports to fix the "Cannot find name 'Loader2'" error
import { User, Trophy, XCircle, Edit2, Check, Search, Sword, CalendarClock, Trash2, AlertTriangle, Terminal, Camera, Upload, Smartphone, Wifi, ArrowLeft, Loader2 } from 'lucide-react';
import { UserProfile, Difficulty, Language } from '../types';
import { getAllUsers, updateUserProfile, sendChallenge, updateChallengeProblem, deleteUserProfile, subscribeToUserProfile } from '../services/firestore';
import { generateProblem } from '../services/geminiService';
import { auth } from '../services/firebase';
import { deleteUser, signOut } from 'firebase/auth';

interface ProfileProps {
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  targetUserId?: string | null; // If null/undefined, it shows currentUser
  onBack?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateUser, targetUserId, onBack }) => {
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOwnProfile = !targetUserId || targetUserId === currentUser.uid;

  useEffect(() => {
    if (isOwnProfile) {
      setTargetUser(currentUser);
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || '');
      setDisplayName(currentUser.displayName || '');
    } else {
      // Subscribe to target user
      const unsub = subscribeToUserProfile(targetUserId!, (user) => {
        setTargetUser(user);
        setBio(user.bio || '');
        setAvatar(user.avatar || '');
        setDisplayName(user.displayName || '');
      });
      return () => unsub();
    }
  }, [targetUserId, currentUser, isOwnProfile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export as compressed base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setAvatar(dataUrl);
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!currentUser.uid) return;

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

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirm) return;

    try {
        if (currentUser.uid) {
            await deleteUserProfile(currentUser.uid);
        }
        
        const user = auth.currentUser;
        if (user) {
            await deleteUser(user);
        }
    } catch (e: any) {
        console.error("Delete failed", e);
        if (e.code === 'auth/requires-recent-login') {
             alert("For security, please sign out and sign in again before deleting your account.");
        } else {
             alert("Failed to delete account. You might need to re-login.");
        }
    }
  };

  if (!targetUser) return null;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-6 animate-in fade-in duration-500">
      
      {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Lobby
          </button>
      )}

      <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Cover Header */}
          <div className="h-32 bg-gradient-to-r from-brand-900 to-dark-surface relative border-b border-dark-border">
             <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                <div className="relative group">
                    <img 
                        src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.uid}`}
                        alt="Profile" 
                        className="w-32 h-32 rounded-2xl border-4 border-dark-surface shadow-xl object-cover bg-dark-bg"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.uid}`;
                        }}
                    />
                    {isEditing && isOwnProfile && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                        </button>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                
                <div className="mb-2">
                    {isEditing ? (
                        <input 
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="bg-dark-bg border border-brand-500 rounded px-3 py-1 text-2xl font-bold text-white focus:outline-none"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold text-white drop-shadow-lg">{targetUser.displayName}</h1>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        {targetUser.status === 'online' ? (
                            targetUser.deviceType === 'mobile' ? (
                                <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                                    <Smartphone className="w-3 h-3" /> Mobile
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                                    <Wifi className="w-3 h-3" /> Desktop
                                </span>
                            )
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold bg-zinc-500/10 px-2 py-0.5 rounded-full border border-zinc-500/20">
                                Offline
                            </span>
                        )}
                        <span className="text-zinc-500 text-xs">•</span>
                        <span className="text-brand-400 text-xs font-bold uppercase tracking-wider">{targetUser.rating} ELO</span>
                    </div>
                </div>
             </div>

             <div className="absolute bottom-4 right-8 flex gap-2">
                {isOwnProfile && (
                    !isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                        >
                            <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="bg-dark-bg hover:bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-sm font-bold border border-dark-border"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveProfile}
                                className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Save
                            </button>
                        </>
                    )
                )}
             </div>
          </div>

          <div className="pt-24 px-8 pb-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-dark-bg border border-dark-border rounded-xl p-5 text-center">
                    <Trophy className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                    <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Win Rate</div>
                    <div className="text-2xl font-bold text-white">
                        {targetUser.wins + targetUser.losses > 0 
                            ? Math.round((targetUser.wins / (targetUser.wins + targetUser.losses)) * 100) 
                            : 0}%
                    </div>
                </div>
                <div className="bg-dark-bg border border-dark-border rounded-xl p-5 text-center">
                    <div className="w-6 h-6 text-green-400 mx-auto mb-2 flex justify-center">
                        <Check className="w-6 h-6" />
                    </div>
                    <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Victories</div>
                    <div className="text-2xl font-bold text-white">{targetUser.wins}</div>
                </div>
                <div className="bg-dark-bg border border-dark-border rounded-xl p-5 text-center">
                    <div className="w-6 h-6 text-red-400 mx-auto mb-2 flex justify-center">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Defeats</div>
                    <div className="text-2xl font-bold text-white">{targetUser.losses}</div>
                </div>
             </div>

             <div className="space-y-6">
                <section>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">About Player</h3>
                    {isEditing ? (
                        <textarea 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about your coding journey..."
                            className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-zinc-300 focus:border-brand-500 focus:outline-none min-h-[120px] resize-none"
                        />
                    ) : (
                        <p className="text-zinc-300 leading-relaxed bg-dark-bg/50 border border-dark-border p-5 rounded-xl">
                            {targetUser.bio || "This user hasn't set a bio yet."}
                        </p>
                    )}
                </section>
                
                {isOwnProfile && (
                    <section className="pt-8 border-t border-dark-border">
                        <h3 className="text-xs font-bold text-red-500/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4" /> Danger Zone
                        </h3>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleDeleteAccount}
                                className="flex-1 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Account
                            </button>
                        </div>
                    </section>
                )}
             </div>
          </div>
      </div>
    </div>
  );
};
