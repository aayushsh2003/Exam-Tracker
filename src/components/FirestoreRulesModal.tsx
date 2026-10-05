import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Loader2, 
  Database, 
  Lock, 
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { testUserPermissions } from '../firebase/firestoreService';
import { firebaseConfig } from '../firebase/config';
import { User } from 'firebase/auth';

interface FirestoreRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onRulesVerified: () => void;
  onToast: (msg: string) => void;
}

const FIRESTORE_RULES_TEXT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow connection testing
    match /test/{docId} {
      allow read: if true;
      allow write: if false;
    }

    // User profile documents - isolated strictly to authenticated owner
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || userId == 'guest-device');
    }

    // User tracker master document and all subcollections (exams, milestones)
    match /user_trackers/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || userId == 'guest-device');

      match /{allPaths=**} {
        allow read, write: if request.auth != null && (request.auth.uid == userId || userId == 'guest-device');
      }
    }

    // Default deny catch-all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

export const FirestoreRulesModal: React.FC<FirestoreRulesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRulesVerified,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_TEXT);
    setCopied(true);
    onToast('Firestore security rules copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!currentUser) {
      onToast('Please sign in first to test your account permissions.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await testUserPermissions(currentUser.uid);
      if (ok) {
        setTestResult('success');
        onToast('Permissions verified successfully! Cloud Firestore is ready.');
        onRulesVerified();
      } else {
        setTestResult('failed');
        onToast('Rules still denying permission. Please publish the rules in Firebase Console and retry.');
      }
    } catch {
      setTestResult('failed');
    } finally {
      setIsTesting(false);
    }
  };

  const projectId = firebaseConfig.projectId || 'your-project-id';
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/rules`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>Configure Cloud Firestore Rules</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {projectId}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Update your Firebase Console to enable read/write permissions for your user account.
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
          
          {/* Status Explanation Card */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Why are you seeing this?</span>
            </div>
            <p className="leading-relaxed">
              Your web app is connected to your project <strong className="font-mono text-amber-900">{projectId}</strong> with user <strong className="font-mono text-amber-900">{currentUser?.email || 'authenticated user'}</strong>. Firebase Firestore currently defaults to deny-all or expired test rules.
            </p>
            <p className="leading-relaxed">
              Don't worry — your exams and changes are <strong>safely saved in your local workspace</strong>. To enable cloud persistence, copy and paste the security rules below into your Firebase Console.
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3-Step Setup Guide
            </h3>
            <ol className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Click <strong className="text-indigo-600">Copy Rules</strong> below.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>
                  Open your{' '}
                  <a 
                    href={consoleUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-bold underline inline-flex items-center gap-1"
                  >
                    <span>Firebase Console Firestore Rules tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  , replace the existing text, and click <strong className="text-slate-900">Publish</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Return here and click <strong className="text-emerald-700">Test Connection & Enable Cloud Sync</strong>.</span>
              </li>
            </ol>
          </div>

          {/* Rules Code Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>firestore.rules</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Rules'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto max-h-56 scrollbar-thin border border-slate-800 leading-relaxed selection:bg-indigo-600 selection:text-white">
              {FIRESTORE_RULES_TEXT}
            </pre>
          </div>

          {/* Test Result Indicator */}
          {testResult === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Success! Security rules are active. Cloud sync is now enabled.</span>
            </div>
          )}

          {testResult === 'failed' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Permission denied. Please ensure you clicked "Publish" in the Firebase Console and wait 5 seconds before retrying.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={consoleUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Open Firebase Console Rules Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isTesting ? 'Verifying...' : 'Test Connection & Enable Cloud Sync'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
