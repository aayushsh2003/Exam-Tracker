import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';

export const googleProvider = new GoogleAuthProvider();

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function loginAsGuest(): Promise<User> {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function updateUserProfileInAuth(displayName?: string, photoURL?: string): Promise<void> {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      ...(displayName ? { displayName } : {}),
      ...(photoURL ? { photoURL } : {})
    });
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
