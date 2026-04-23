import { Injectable, signal } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, onAuthStateChanged, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, serverTimestamp, getDocFromServer, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export let app: FirebaseApp;
export let auth: Auth;
export let db: Firestore;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export interface RoomPlayer {
  uid: string;
  name: string;
  score: number;
  status: 'playing' | 'gameover' | 'waiting';
}

export interface SabotageEvent {
  type: 'email_wall' | 'freeze';
  senderName: string;
  targetId: string;
  timestamp: number;
}

export interface MultiplayerRoom {
  roomId: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  gameMode: string;
  players: Record<string, RoomPlayer>;
  sabotages?: Record<string, SabotageEvent>;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  title?: string;
  score: number;
  mode: string;
  timestamp: unknown;
}

export interface Challenge {
  id?: string;
  creatorId: string;
  creatorName: string;
  targetScore: number;
  gameMode: string;
  createdAt: unknown;
}

export interface UserProfile {
  displayName: string;
  highestScore_endless?: number;
  highestScore_championship?: number;
  highestScore_takeover?: number;
  highestScore_quiet?: number;
  lifetimeSynergy?: number;
  unlockedSkills?: string[];
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  user = signal<User | null>(null);
  authReady = signal<boolean>(false);
  
  constructor() {
    if (typeof window !== 'undefined') {
      onAuthStateChanged(auth, (u) => {
        this.user.set(u);
        this.authReady.set(true);
      });

      // Test connection as required
      this.testConnection();
    } else {
      this.authReady.set(true);
    }
  }

  async testConnection() {
    if (typeof window === 'undefined') return;
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Ensure user profile snippet exists
      const userRef = doc(db, 'users', result.user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          displayName: result.user.displayName || 'Corporate Drone',
          createdAt: serverTimestamp(),
          highestScore_endless: 0,
          highestScore_championship: 0,
          highestScore_takeover: 0,
          highestScore_quiet: 0,
          lifetimeSynergy: 0,
          unlockedSkills: []
        });
      }
    } catch (err) {
      console.error('Login Failed', err);
    }
  }

  async logout() {
    await signOut(auth);
  }

  isAdmin(): boolean {
    const email = this.user()?.email;
    return email === 'gourav.k.24@gmail.com' || email === '24gourav11@gmail.com';
  }

  async submitScore(score: number, mode: 'endless' | 'championship' | 'takeover' | 'quiet', currentTitle?: string) {
    const u = this.user();
    if (!u) return;

    try {
      // 1. Update personal best in users doc
      const userRef = doc(db, 'users', u.uid);
      const snap = await getDoc(userRef);
      const data = snap.exists() ? snap.data() : {};
      
      const scoreKey = `highestScore_${mode}`;
      const isNewBest = score > (data[scoreKey] || 0);

      const updates: Record<string, unknown> = {};
      if (isNewBest) {
        updates[scoreKey] = score;
      }
      
      if (Object.keys(updates).length > 0) {
        // use setDoc with merge to safely update
        await setDoc(userRef, updates, { merge: true });
      }

      // 2. Add to global leaderboard collection
      const scoreId = `${u.uid}_${mode}_${Date.now()}`;
      const payload: LeaderboardEntry = {
        userId: u.uid,
        displayName: u.displayName || 'Corporate Drone',
        score: score,
        mode: mode,
        timestamp: serverTimestamp()
      };
      
      if (currentTitle) {
          payload.title = currentTitle;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setDoc(doc(db, `leaderboards/${mode}/entries`, scoreId), payload as any);
      
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }

  async getLeaderboard(mode: 'endless' | 'championship' | 'takeover' | 'quiet'): Promise<LeaderboardEntry[]> {
    try {
      const isAdm = this.isAdmin();
      const q = query(
        collection(db, `leaderboards/${mode}/entries`),
        orderBy('score', 'desc'),
        limit(isAdm ? 100 : 10)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as LeaderboardEntry);
    } catch (err) {
      console.error('Failed to get leaderboard:', err);
      return [];
    }
  }

  async getGlobalLeaderboard(): Promise<(LeaderboardEntry & {level: number, globalTitle?: string})[]> {
    try {
      if (!this.user()) {
         return []; // Require auth for users collection
      }
      const isAdm = this.isAdmin();
      const q = query(
        collection(db, 'users'),
        orderBy('lifetimeSynergy', 'desc'),
        limit(isAdm ? 1000 : 100) // Support up to 1000 levels
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        const score = data['lifetimeSynergy'] || 0;
        
        // Exponential Math: taking 1,000,000s of points to reach high levels.
        const level = Math.floor(Math.sqrt(score / 150)) + 1;
        
        let globalTitle = 'Unpaid Intern';
        if (level >= 300) globalTitle = 'Corporate Overlord';
        else if (level >= 200) globalTitle = 'Chief Networking Officer';
        else if (level >= 150) globalTitle = 'Executive VP';
        else if (level >= 100) globalTitle = 'VP of Synergy';
        else if (level >= 75) globalTitle = 'Senior Director';
        else if (level >= 50) globalTitle = 'Middle Manager';
        else if (level >= 35) globalTitle = 'Shift Supervisor';
        else if (level >= 20) globalTitle = 'Junior Associate';
        else if (level >= 10) globalTitle = 'Coffee Fetcher';

        return {
           userId: d.id,
           displayName: data['displayName'] || 'Corporate Drone',
           score: score,
           mode: 'global',
           level: level,
           globalTitle: globalTitle,
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           timestamp: data['createdAt'] || serverTimestamp() as any
        };
      });
    } catch (err) {
      console.error('Failed to get global leaderboard:', err);
      return [];
    }
  }

  async syncMeta(lifetimeSynergy: number, unlockedSkills: string[]) {
    const u = this.user();
    if (!u) return;
    try {
      const userRef = doc(db, 'users', u.uid);
      await setDoc(userRef, {
        lifetimeSynergy,
        unlockedSkills
      }, { merge: true });
    } catch (error) {
      console.error('Failed to sync meta to cloud:', error);
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const u = this.user();
    if (!u) return null;
    try {
      const snap = await getDocFromServer(doc(db, 'users', u.uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Failed to get user profile', err);
      return null;
    }
  }

  async createChallenge(score: number, mode: string): Promise<string | null> {
    const u = this.user();
    if (!u) return null;
    
    try {
      const challengeId = `${u.uid}_${Date.now()}`;
      const docData = {
        creatorId: u.uid,
        creatorName: (u.displayName || 'Corporate Drone').substring(0, 90),
        targetScore: Math.max(0, Math.floor(score || 0)),
        gameMode: String(mode).substring(0, 20),
        createdAt: serverTimestamp()
      };
      console.log('Creating challenge:', challengeId, docData);
      await setDoc(doc(db, 'challenges', challengeId), docData);
      return challengeId;
    } catch (err) {
      console.error('Failed to create challenge:', err);
      // Fallback: If firestore write fails, we can still generate a local fake ID so the user can copy the URL in the demo environment
      const fallbackId = `local_${Date.now()}`;
      return fallbackId;
    }
  }

  async getChallenge(challengeId: string): Promise<Challenge | null> {
    try {
      const snap = await getDocFromServer(doc(db, 'challenges', challengeId));
      if (snap.exists()) {
         const data = snap.data() as Challenge;
         data.id = snap.id;
         return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch challenge:', err);
      return null;
    }
  }

  // --- MULTIPLAYER ROOMS ---
  async createRoom(roomId: string, mode: string): Promise<boolean> {
     const u = this.user();
     if (!u) return false;
     try {
       await setDoc(doc(db, 'multiplayer_rooms', roomId), {
          hostId: u.uid,
          status: 'waiting',
          gameMode: mode,
          players: {
             [u.uid]: { uid: u.uid, name: u.displayName || 'Drone', score: 0, status: 'waiting' }
          },
          createdAt: serverTimestamp()
       });
       return true;
     } catch (err) {
       console.error("Create Room failed:", err);
       return false;
     }
  }

  async joinRoom(roomId: string): Promise<boolean> {
     const u = this.user();
     if (!u) return false;
     try {
       await setDoc(doc(db, 'multiplayer_rooms', roomId), {
          players: {
             [u.uid]: { uid: u.uid, name: u.displayName || 'Drone', score: 0, status: 'waiting' }
          }
       }, { merge: true });
       return true;
     } catch (err) {
       console.error("Join Room Failed:", err);
       return false;
     }
  }

  async updateRoomPlayer(roomId: string, score: number, status: 'playing' | 'gameover' | 'waiting') {
     const u = this.user();
     if (!u) return;
     try {
       await setDoc(doc(db, 'multiplayer_rooms', roomId), {
          players: {
             [u.uid]: { uid: u.uid, name: u.displayName || 'Drone', score, status }
          }
       }, { merge: true });
     } catch (err) {
       // Silent fail for score updates to prevent log spam
       console.debug("Silent fail room update", err);
     }
  }

  async startRoomMatch(roomId: string) {
     try {
       await setDoc(doc(db, 'multiplayer_rooms', roomId), {
          status: 'playing'
       }, { merge: true });
     } catch (err) {
       console.error("Start room match failed", err);
     }
  }

  async sendSabotage(roomId: string, targetId: string, type: 'email_wall' | 'freeze') {
     const u = this.user();
     if (!u) return;
     const sabId = `${u.uid}_${Date.now()}`;
     try {
       await setDoc(doc(db, 'multiplayer_rooms', roomId), {
          sabotages: {
             [sabId]: {
                type,
                targetId,
                senderName: u.displayName || 'Drone',
                timestamp: Date.now()
             }
          }
       }, { merge: true });
     } catch (err) {
       console.error("Send sabotage failed", err);
     }
  }
}
