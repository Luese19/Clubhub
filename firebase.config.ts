import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Check if Firebase is properly configured
const isConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
                    import.meta.env.VITE_FIREBASE_API_KEY !== "your_api_key_here";

let app: any;
let auth: any;
let db: any;
let storage: any;

if (isConfigured) {
  // Initialize Firebase with real config
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Create mock objects when Firebase is not configured
  console.warn("🚨 Firebase not configured. Please set up your Firebase environment variables.");
  
  app = null;
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured")),
    createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured")),
    signOut: () => Promise.reject(new Error("Firebase not configured")),
  };
  db = null;
  storage = null;
}

export { auth, db, storage };
export default app;
