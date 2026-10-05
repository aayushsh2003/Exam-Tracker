import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  loginAsGuest 
} from '../firebase/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  initialMode?: 'signin' | 'signup';
}

const PREPARATION_STREAMS = [
  'Computer Science & IT',
  'Banking & Financial Services (IBPS / SBI / SEBI)',
  'Scientific & Space Research (ISRO / BARC)',
  'Engineering & PSU Cadres (GATE / CIL / IOCL / AAI)',
  'Delhi & State Administrative (DSSSB / RSSB / SSC)',
  'All National Competitive Recruitments'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onToast,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetCategory, setTargetCategory] = useState(PREPARATION_STREAMS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const user = await loginWithEmail(email, password);
        onToast(`Welcome back, ${user.displayName || user.email}!`);
      } else {
        const user = await registerWithEmail(email, password, displayName || undefined);
        onToast(`Account created for ${user.email}! Initializing your personal workspace.`);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      onToast(`Signed in with Google: ${user.displayName || user.email}`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Google sign-in error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginAsGuest();
      onToast('Logged in as Guest user with isolated storage.');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Guest sign-in error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Briefcase className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  {mode === 'signin' ? 'Sign In to Your Workspace' : 'Create Candidate Account'}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Private exam database, scorecard logs, and cloud sync.
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

          {/* Mode Switch Tabs */}
          <div className="mt-5 flex bg-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 bg-slate-50/50">
          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-slate-50 px-2">or with email credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aayush Sharma"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Primary Target Domain</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PREPARATION_STREAMS.map(stream => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signin' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In to Workspace' : 'Register & Start Tracking'}</span>
            </button>
          </form>

          {/* Guest fallback button */}
          <div className="pt-2 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={isLoading}
              className="text-xs text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Or continue without password as <span className="font-bold underline">Guest Aspirant</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            🔒 Every user has their own completely isolated exams and data.
          </p>
        </div>
      </div>
    </div>
  );
};
