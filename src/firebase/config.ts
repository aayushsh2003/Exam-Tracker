import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Configuration
 * All sensitive credentials and API keys are loaded securely from environment
 * variables (VITE_FIREBASE_*) and are never hardcoded in public source code.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Check if credentials are properly supplied
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

// Initialize Firebase safely (singleton pattern)
export const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(isFirebaseConfigured ? firebaseConfig : {
      apiKey: "unconfigured-key",
      projectId: "unconfigured-project"
    });

// Initialize Firebase Authentication & Firestore Database
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics initialization
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    try {
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      if (await isSupported()) {
        return getAnalytics(app);
      }
    } catch (e) {
      console.warn('Firebase Analytics not supported in this environment', e);
    }
  }
  return null;
};
