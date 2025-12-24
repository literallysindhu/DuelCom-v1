import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Helper to get local config
const getLocalConfig = () => {
    try {
        const s = localStorage.getItem('duel_config');
        return s ? JSON.parse(s) : null;
    } catch(e) { return null; }
};

const localConfig = getLocalConfig();

// Prioritize Env Vars
const envConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const hasEnvConfig = !!(envConfig.apiKey && envConfig.apiKey !== 'undefined' && envConfig.apiKey !== '');

// Default provided config (Fallback)
const defaultConfig = {
  apiKey: "AIzaSyCkpwqXaubrG048OxAzMEAbt8b0gXKP0Jw",
  authDomain: "duelcom-7afdd.firebaseapp.com",
  projectId: "duelcom-7afdd",
  storageBucket: "duelcom-7afdd.firebasestorage.app",
  messagingSenderId: "2188748384",
  appId: "1:2188748384:web:390241f5c7f5ccc0148505",
  measurementId: "G-J1K32L0ZGN"
};

const firebaseConfig = hasEnvConfig ? envConfig : (localConfig?.firebase || defaultConfig);

// Gemini Key: Check env var first, then local config
export const geminiKey = process.env.API_KEY || localConfig?.gemini?.apiKey;

// Initialize Firebase safely
let app: any;
let auth: any;
let db: any;
let isConfigured = false;

if (firebaseConfig?.apiKey) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        isConfigured = true;
    } catch(e) {
        console.error("Firebase init failed:", e);
    }
}

export { auth, db, isConfigured };

export const saveConfig = (data: any) => {
    localStorage.setItem('duel_config', JSON.stringify(data));
    window.location.reload();
};

export const clearConfig = () => {
    localStorage.removeItem('duel_config');
    window.location.reload();
};