import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// User's provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDr1kbGRuvVEALSwGdziraO9P5pLhJ97l8",
  authDomain: "exam-tracker-42bc0.firebaseapp.com",
  projectId: "exam-tracker-42bc0",
  storageBucket: "exam-tracker-42bc0.firebasestorage.app",
  messagingSenderId: "639026324878",
  appId: "1:639026324878:web:166b2d8f03cb2bd13830df",
  measurementId: "G-8TT4HJZ4JR"
};

// Initialize Firebase (singleton pattern)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication & Firestore Database
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics initialization
export const initAnalytics = async () => {
  if (typeof window !== 'undefined') {
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
