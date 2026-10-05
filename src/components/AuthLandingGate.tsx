import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  User, 
  Loader2, 
  AlertCircle,
  Briefcase,
  Layers,
  Database,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  loginAsGuest 
} from '../firebase/authService';

interface AuthLandingGateProps {
  onAuthenticated: () => void;
  onToast: (msg: string) => void;
}

const PREPARATION_STREAMS = [
  'Computer Science & IT',
  'Banking & Financial Services (IBPS / SBI / SEBI)',
  'Scientific & Space Research (ISRO / BARC)',
  'Engineering & PSU Cadres (GATE / CIL / IOCL / AAI)',
  'Delhi & State Administrative (DSSSB / RSSB / SSC)',
  'All National Competitive Recruitments'
];

export const AuthLandingGate: React.FC<AuthLandingGateProps> = ({
  onToast,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetCategory, setTargetCategory] = useState(PREPARATION_STREAMS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
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
        onToast(`Welcome back, ${user.displayName || user.email}! Loading your private workspace.`);
      } else {
        const user = await registerWithEmail(email, password, displayName || undefined);
        onToast(`Account created for ${user.email}! Initializing your private recruitment tracker.`);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication error. Please check your credentials.';
      if (msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        msg = 'Invalid email or password. Please check your credentials or create an account.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'An account already exists with this email. Please sign in instead.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      onToast(`Signed in as ${user.displayName || user.email}. Loading your workspace.`);
    } catch (err: any) {
      console.error('Google auth error:', err);
      setErrorMessage(err.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginAsGuest();
      onToast('Access granted via isolated Guest Sandbox session.');
    } catch (err: any) {
      console.error('Guest auth error:', err);
      setErrorMessage(err.message || 'Could not initialize guest session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>
      <div className="absolute top-1/2 left-3/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2"></div>

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                  EXAM TRACKER
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline">
                  2026–2027
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Indian Competitive Recruitment Command Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Private & Isolated</span>
              <span className="sm:hidden">Secure</span>
            </div>

            <button
              onClick={() => {
                setMode(m => m === 'signin' ? 'signup' : 'signin');
                setErrorMessage(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {mode === 'signin' ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 relative z-10">
        
        {/* Left Column: Platform Manifesto & Zero-Public Guarantee */}
        <div className="flex-1 space-y-6 max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Strict Authentication Protected Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Your Private Portal For All{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-amber-200 bg-clip-text text-transparent">
              Competitive Recruitments
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            All candidate exams, admit card releases, application fees, scorecard logs, and notes are strictly private. Nobody without authentication can view your tracked recruitments or study schedules.
          </p>

          {/* Privacy Security Checklist */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Protection & Privacy Architecture</span>
            </div>
            
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Public Exposure:</strong> Exam lists, notes, and progress are visible ONLY after successful sign-in.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Per-User Data Isolation:</strong> Every candidate maintains their own segregated cloud records. User A cannot view User B.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Google Cloud Firestore Security:</strong> Enforced by server-side ABAC rules (<code className="font-mono text-indigo-300">request.auth.uid == userId</code>).</span>
              </li>
            </ul>
          </div>

          {/* Supported Streams Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Banking</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">IBPS & SBI Cadres</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Scientific</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">ISRO ICRB & BARC</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Engineering</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">GATE & PSU Cadres</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="w-full max-w-md">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
            
            {/* Ambient top highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400"></div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-950/80 p-1 rounded-xl mb-6 border border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signin' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
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
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signup' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header info */}
            <div className="mb-5 text-left">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {mode === 'signin' ? 'Sign In to Your Workspace' : 'Create Candidate Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'signin' 
                  ? 'Access your private recruitment tracking dashboard.' 
                  : 'Start tracking 31 competitive exams in your private datastore.'}
              </p>
            </div>

            {/* Google 1-Click Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer disabled:opacity-60 mb-4"
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

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                <span className="bg-slate-900 px-3">or email credentials</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
              {mode === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aayush Sharma"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Target Stream</label>
                    <select
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {PREPARATION_STREAMS.map(stream => (
                        <option key={stream} value={stream}>{stream}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'signin' ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>
                  {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In to Workspace' : 'Register & Enter Workspace'}
                </span>
              </button>
            </form>

            {/* Guest Sandbox Option */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center space-y-1.5">
              <span className="text-[11px] text-slate-400 block">
                Want to test the interface without entering credentials?
              </span>
              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={isLoading}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span>Enter via Guest Sandbox</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>🔒 2026–2027 Indian Competitive Examination Command Center • Cloud Firestore ABAC Security</p>
      </footer>
    </div>
  );
};
