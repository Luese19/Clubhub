import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Debug: Log raw environment variables
console.log('Raw environment variables:', {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  ALL_ENV: import.meta.env
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAOLOenZ8P11SfkHoMKNFBmhBNZe2jvJUo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clubhub-19b84.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clubhub-19b84",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clubhub-19b84.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "206243777776",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:206243777776:web:e0a3d7a3c5ea74d36e0635",
};

// Check if Firebase is properly configured
const isConfigured = firebaseConfig.apiKey && 
                    firebaseConfig.projectId && 
                    firebaseConfig.authDomain &&
                    firebaseConfig.apiKey.startsWith('AIza');

console.log('Firebase config check:', {
  isConfigured,
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  hasAuthDomain: !!firebaseConfig.authDomain,
  apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 10)
});

let app: any;
let auth: any;
let db: any;
let storage: any;

if (isConfigured) {
  // Initialize Firebase with real config
  console.log('Initializing Firebase with config:', firebaseConfig);
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
} else {
  // Create mock objects when Firebase is not configured
  console.warn("🚨 Firebase not configured. Please set up your Firebase environment variables.");
  console.warn("Missing Firebase configuration. Please:");
  console.warn("1. Copy .env.example to .env");
  console.warn("2. Fill in your Firebase project details");
  console.warn("3. Restart your development server");
  console.warn("Current config status:", {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    storageBucket: !!firebaseConfig.storageBucket,
    messagingSenderId: !!firebaseConfig.messagingSenderId,
    appId: !!firebaseConfig.appId,
  });
  
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
