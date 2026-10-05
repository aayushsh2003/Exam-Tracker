import React, { useState, useRef } from 'react';
import { 
  X, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Upload, 
  FileJson, 
  Database,
  ShieldCheck,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  loginAsGuest, 
  logoutUser 
} from '../firebase/authService';
import { 
  saveUserTrackerData, 
  fetchUserTrackerData, 
  importJsonDirectlyToFirestore 
} from '../firebase/firestoreService';
import { ExamItem, MilestoneAction } from '../types';
import { firebaseConfig } from '../firebase/config';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  exams: ExamItem[];
  milestones: MilestoneAction[];
  onDataLoadedFromCloud: (exams: ExamItem[], milestones?: MilestoneAction[]) => void;
  onToast: (msg: string) => void;
  lastSyncedAt: string | null;
  setLastSyncedAt: (dateStr: string) => void;
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  exams,
  milestones,
  onDataLoadedFromCloud,
  onToast,
  lastSyncedAt,
  setLastSyncedAt,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Auth form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (authMode === 'signin') {
        await loginWithEmail(email, password);
        onToast(`Signed in as ${email}`);
      } else {
        await registerWithEmail(email, password, displayName || undefined);
        onToast(`Account created for ${email}`);
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const user = await loginWithGoogle();
      onToast(`Signed in with Google: ${user.email || user.displayName}`);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Google sign-in error.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      await loginAsGuest();
      onToast('Logged in as Guest user');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Guest sign-in error.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      onToast('Signed out from Firebase');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handlePushToFirestore = async () => {
    const uid = currentUser?.uid || 'guest-device';
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatusMsg(null);

    const res = await saveUserTrackerData(uid, exams, milestones);
    setIsSyncing(false);

    if (res.success) {
      const nowStr = new Date().toLocaleTimeString();
      setLastSyncedAt(nowStr);
      setSyncStatusMsg(`Cloud Sync Complete: ${exams.length} exams saved to Firestore at ${nowStr}`);
      onToast(`Moved ${exams.length} exams to Cloud Firestore!`);
    } else {
      setSyncError(res.message);
    }
  };

  const handlePullFromFirestore = async () => {
    const uid = currentUser?.uid || 'guest-device';
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatusMsg(null);

    const res = await fetchUserTrackerData(uid);
    setIsSyncing(false);

    if (res.success && res.exams) {
      onDataLoadedFromCloud(res.exams, res.milestones);
      const nowStr = new Date().toLocaleTimeString();
      setLastSyncedAt(nowStr);
      setSyncStatusMsg(`Successfully loaded ${res.exams.length} exams from Firestore at ${nowStr}`);
      onToast(`Loaded ${res.exams.length} exams from Firestore!`);
    } else {
      setSyncError(res.error || 'Failed to fetch cloud records.');
    }
  };

  const handleUploadJsonToFirestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uid = currentUser?.uid || 'guest-device';
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatusMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await importJsonDirectlyToFirestore(uid, content);
      setIsSyncing(false);

      if (res.success && res.exams) {
        onDataLoadedFromCloud(res.exams, res.milestones);
        const nowStr = new Date().toLocaleTimeString();
        setLastSyncedAt(nowStr);
        setSyncStatusMsg(`Imported ${res.count} exams from ${file.name} directly into Firestore.`);
        onToast(`Imported ${res.count} exams directly to Firestore!`);
      } else {
        setSyncError(res.error || 'Failed to import JSON to Firestore.');
      }
    };
    reader.onerror = () => {
      setIsSyncing(false);
      setSyncError('Error reading uploaded JSON file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Firebase Firestore Cloud Hub</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {firebaseConfig.projectId || 'Cloud Firestore'}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Synchronize your 31 competitive exam records with cloud Firestore and authentication.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto bg-slate-50/50">
          
          {/* USER AUTH STATUS CARD */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentUser ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      {currentUser ? (currentUser.displayName || currentUser.email || 'Guest User') : 'Not Signed In'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentUser ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {currentUser ? (currentUser.isAnonymous ? 'Guest' : 'Authenticated') : 'Local Only'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {currentUser ? `UID: ${currentUser.uid.slice(0, 12)}...` : 'Sign in to access your cloud Firestore database.'}
                  </p>
                </div>
              </div>

              {currentUser && (
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

            {/* If NOT signed in: Auth Form & Buttons */}
            {!currentUser && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <span>Sign in with Google</span>
                  </button>
                  <button
                    onClick={handleGuestSignIn}
                    disabled={isAuthLoading}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Continue as Guest
                  </button>
                </div>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-white px-2">or with email</span></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-2.5">
                  {authMode === 'signup' && (
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {authError && (
                    <p className="text-[11px] text-rose-600 font-medium">{authError}</p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer"
                    >
                      {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
                    </button>
                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      {isAuthLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* FIRESTORE DATABASE ACTIONS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                Firestore Database Synchronization
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {exams.length} Local Exams
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Move your entire 31-exam database to Firebase Firestore for permanent cloud storage across all your devices:
            </p>

            {/* Status alerts */}
            {syncStatusMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{syncStatusMsg}</span>
              </div>
            )}

            {syncError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{syncError}</span>
              </div>
            )}

            {/* Cloud Push and Pull Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Push Local Data to Firebase */}
              <button
                type="button"
                onClick={handlePushToFirestore}
                disabled={isSyncing}
                className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-left transition-all group flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                    <CloudUpload className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Push Data to Firebase</span>
                  </div>
                  <p className="text-[11px] text-indigo-800/80 mt-1 leading-normal">
                    Uploads current 31 exam records to Firestore database.
                  </p>
                </div>
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mt-0.5" />
                ) : (
                  <CloudUpload className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform mt-0.5" />
                )}
              </button>

              {/* Pull from Firebase */}
              <button
                type="button"
                onClick={handlePullFromFirestore}
                disabled={isSyncing}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all group flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <CloudDownload className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pull from Firebase</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Fetches latest cloud records saved in Firestore.
                  </p>
                </div>
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 text-slate-600 animate-spin mt-0.5" />
                ) : (
                  <CloudDownload className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform mt-0.5" />
                )}
              </button>
            </div>

            {/* Upload JSON Directly to Firebase */}
            <div className="pt-2 border-t border-slate-100">
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleUploadJsonToFirestore}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => jsonFileInputRef.current?.click()}
                disabled={isSyncing}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50/70 text-indigo-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload JSON file directly to Firestore database</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-1">
                Reads the JSON file, validates schema, and writes directly into your Firebase Firestore account.
              </p>
            </div>
          </div>

          {/* Connection Footer Info */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Project ID: <strong className="font-mono text-slate-800">{firebaseConfig.projectId || 'Active'}</strong></span>
            </span>
            <span>Last Synced: <strong className="text-slate-800">{lastSyncedAt || 'Not yet'}</strong></span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
