import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkpwqXaubrG048OxAzMEAbt8b0gXKP0Jw",
  authDomain: "duelcom-7afdd.firebaseapp.com",
  projectId: "duelcom-7afdd",
  storageBucket: "duelcom-7afdd.firebasestorage.app",
  messagingSenderId: "2188748384",
  appId: "1:2188748384:web:390241f5c7f5ccc0148505",
  measurementId: "G-J1K32L0ZGN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Gemini Key from environment variable
export const geminiKey = process.env.API_KEY;

// Legacy exports to maintain compatibility if imports haven't updated yet
export const isConfigured = true;
export const clearConfig = () => { console.log("Config is hardcoded."); };
export const saveConfig = (config?: any) => { console.log("Config saved (simulation)", config); };