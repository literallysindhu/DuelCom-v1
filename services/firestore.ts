import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  onSnapshot,
  increment,
  orderBy,
  limit
} from 'firebase/firestore';
import { UserProfile, Challenge, Difficulty, Language, Problem } from '../types';

export const createUserProfile = async (user: any) => {
  if (!user || !user.uid) throw new Error("Invalid user data for profile creation");
  
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      bio: "Ready to code!",
      rating: 1200,
      wins: 0,
      losses: 0,
      status: 'online',
      lastSeen: Date.now()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
  
  // Update last seen on login
  await updateDoc(userRef, { status: 'online', lastSeen: Date.now() });
  
  const userData = snapshot.data();
  return { ...userData, uid: user.uid } as UserProfile;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  if (!uid) throw new Error("Cannot update profile: Missing User ID");
  
  const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, cleanData);
};

export const deleteUserProfile = async (uid: string) => {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
};

export const setUserOnlineStatus = async (uid: string, status: 'online' | 'offline') => {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { 
    status,
    lastSeen: Date.now()
  });
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const q = query(collection(db, 'users'), orderBy('lastSeen', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
};

export const subscribeToUserProfile = (uid: string, callback: (user: UserProfile) => void) => {
  if (!uid) return () => {};
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ ...doc.data(), uid: doc.id } as UserProfile);
    }
  });
};

export const getUserHistory = async (uid: string): Promise<Challenge[]> => {
  if (!uid) return [];
  
  // Fetching where user is 'from' OR 'to' without complex ordering to avoid composite index requirements
  const q1 = query(collection(db, 'duels'), where('fromId', '==', uid));
  const q2 = query(collection(db, 'duels'), where('toId', '==', uid));
  
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
  const results = new Map<string, Challenge>();
  
  snap1.docs.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() } as Challenge));
  snap2.docs.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() } as Challenge));
  
  // Sort client-side to avoid index error
  return Array.from(results.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const sendChallenge = async (
  fromUser: UserProfile, 
  toUser: UserProfile, 
  difficulty: Difficulty, 
  language: Language,
  problem: Problem | null,
  scheduledTime?: number
) => {
  const challenge: any = {
    fromId: fromUser.uid,
    fromName: fromUser.displayName,
    fromAvatar: fromUser.avatar,
    toId: toUser.uid,
    toName: toUser.displayName,
    toAvatar: toUser.avatar,
    status: 'pending',
    difficulty,
    language,
    problem: problem || null,
    timestamp: Date.now(),
    fromCheckedIn: false,
    toCheckedIn: false
  };

  if (scheduledTime) {
    challenge.scheduledTime = scheduledTime;
  }
  
  const docRef = await addDoc(collection(db, 'duels'), challenge);
  return { id: docRef.id, ...challenge };
};

export const updateChallengeProblem = async (challengeId: string, problem: Problem) => {
  if (!challengeId) return;
  const challengeRef = doc(db, 'duels', challengeId);
  await updateDoc(challengeRef, { problem });
};

export const respondToChallenge = async (challengeId: string, status: Challenge['status']) => {
  if (!challengeId) return;
  const challengeRef = doc(db, 'duels', challengeId);
  await updateDoc(challengeRef, { status });
};

export const checkInToChallenge = async (challengeId: string, userId: string, isCreator: boolean) => {
  if (!challengeId) return;
  const challengeRef = doc(db, 'duels', challengeId);
  
  if (isCreator) {
    await updateDoc(challengeRef, { fromCheckedIn: true });
  } else {
    await updateDoc(challengeRef, { toCheckedIn: true });
  }
};

export const submitDuelSolution = async (challengeId: string, isCreator: boolean, code: string) => {
  if (!challengeId) return;
  const challengeRef = doc(db, 'duels', challengeId);
  
  if (isCreator) {
    await updateDoc(challengeRef, { fromCode: code });
  } else {
    await updateDoc(challengeRef, { toCode: code });
  }
};

export const updateUserGameStats = async (userId: string, result: 'win' | 'loss') => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    if (result === 'win') {
        await updateDoc(userRef, {
            wins: increment(1),
            rating: increment(25)
        });
    } else {
        await updateDoc(userRef, {
            losses: increment(1),
            rating: increment(-25)
        });
    }
  } catch (e) {
    console.error(`Failed to update stats for ${userId}:`, e);
  }
};

export const resolveDuelTimeout = async (challenge: Challenge, winnerId: string) => {
  const challengeRef = doc(db, 'duels', challenge.id);
  await updateDoc(challengeRef, { 
    status: 'completed',
    winnerId
  });
};

export const subscribeToIncomingChallenges = (userId: string, callback: (challenges: Challenge[]) => void) => {
  if (!userId) return () => {};
  
  const q = query(
    collection(db, 'duels'), 
    where('toId', '==', userId),
    where('status', '==', 'pending')
  );
  
  return onSnapshot(q, (snapshot) => {
    const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    callback(challenges);
  }, (error) => {
      console.error("Error subscribing to incoming challenges:", error);
  });
};

export const subscribeToScheduledChallenges = (userId: string, callback: (challenges: Challenge[]) => void) => {
  if (!userId) return () => {};

  const challengesMap = new Map<string, Challenge>();

  const updateCallback = () => {
    callback(Array.from(challengesMap.values()));
  };

  const q1 = query(
    collection(db, 'duels'),
    where('status', 'in', ['accepted', 'in_progress']),
    where('toId', '==', userId)
  );

  const q2 = query(
    collection(db, 'duels'),
    where('status', 'in', ['accepted', 'in_progress']),
    where('fromId', '==', userId)
  );

  const handleSnapshot = (snapshot: any) => {
    snapshot.docs.forEach((doc: any) => {
      challengesMap.set(doc.id, { id: doc.id, ...doc.data() } as Challenge);
    });
    snapshot.docChanges().forEach((change: any) => {
      if (change.type === 'removed') {
        challengesMap.delete(change.doc.id);
      }
    });
    updateCallback();
  };

  const unsub1 = onSnapshot(q1, handleSnapshot, (err) => console.log("Sub1 Error:", err));
  const unsub2 = onSnapshot(q2, handleSnapshot, (err) => console.log("Sub2 Error:", err));

  return () => {
    unsub1();
    unsub2();
  };
};

export const subscribeToActiveDuel = (challengeId: string, callback: (challenge: Challenge) => void) => {
  if (!challengeId) return () => {};
  const docRef = doc(db, 'duels', challengeId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Challenge);
    }
  });
};

export const subscribeToSingleChallenge = (challengeId: string, callback: (challenge: Challenge) => void) => {
    if (!challengeId) return () => {};
    const docRef = doc(db, 'duels', challengeId);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as Challenge);
        }
    });
};

export const completeDuel = async (challengeId: string, winnerId: string, loserId: string, winReason?: string) => {
  if (!challengeId) return;

  const challengeRef = doc(db, 'duels', challengeId);
  const updateData: any = { 
    status: 'completed',
    winnerId: winnerId
  };

  if (winReason) {
    updateData.winReason = winReason;
  }
  
  await updateDoc(challengeRef, updateData);
};