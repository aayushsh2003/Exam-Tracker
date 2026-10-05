import React, { useState, useRef } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Cloud, 
  CloudUpload, 
  CloudDownload,
  Compass, 
  Database, 
  Download, 
  ExternalLink, 
  FileText, 
  FolderLock, 
  GitCommit, 
  Layers, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Upload, 
  Award,
  ChevronRight,
  Flame,
  CheckCircle,
  XCircle,
  Loader2,
  LogIn,
  LogOut,
  IndianRupee,
  AlertCircle,
  Radio,
  FileJson
} from 'lucide-react';
import { ExamItem, MilestoneAction, ActiveTab, UserProfile } from '../types';
import { exportCategorizedJson } from '../utils/exportUtils';
import { User } from 'firebase/auth';

interface HomeViewProps {
  exams: ExamItem[];
  milestones: MilestoneAction[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectExam: (exam: ExamItem) => void;
  onOpenCompleteModal?: (exam: ExamItem) => void;
  onOpenFirebaseModal: () => void;
  onOpenBackupModal: () => void;
  onAddNewExam: () => void;
  currentUser: User | null;
  userProfile: UserProfile | null;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  lastSyncedAt: string | null;
  onMoveDataToFirebase: () => Promise<void>;
  onUploadJsonToFirebase: (file: File) => Promise<void>;
  isSyncingFirebase: boolean;
  onQuickGoogleSignIn?: () => Promise<void>;
  onQuickGuestSignIn?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  onToast: (msg: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  exams,
  milestones,
  setActiveTab,
  onSelectExam,
  onOpenCompleteModal,
  onOpenFirebaseModal,
  onOpenBackupModal,
  onAddNewExam,
  currentUser,
  userProfile,
  onOpenProfileModal,
  onOpenAuthModal,
  lastSyncedAt,
  onMoveDataToFirebase,
  onUploadJsonToFirebase,
  isSyncingFirebase,
  onQuickGoogleSignIn,
  onQuickGuestSignIn,
  onSignOut,
  onToast,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const total = exams.length;

  const candidateName = userProfile?.displayName || currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Candidate');
  const targetCategory = userProfile?.targetCategory || 'Computer Science & Competitive Recruitments';

  // Categorized exams partition
  const completedAnnounced = exams.filter(
    e => e.categoryGroup === 'completedAnnounced' || (e.statusTag && e.statusTag.includes('Not Qualified'))
  );
  const completedAwaited = exams.filter(
    e => e.categoryGroup === 'completedAwaited' || (e.statusTag && (e.statusTag.includes('awaited') || e.statusTag.includes('next stage')))
  );
  const awaitingDate = exams.filter(
    e => e.categoryGroup === 'awaitingDate' || (e.statusTag && e.statusTag.includes('TBA')) || (!e.isCompleted && e.examDate.includes('TBA'))
  );
  const upcomingActive = exams
    .filter(e => !completedAnnounced.includes(e) && !completedAwaited.includes(e) && !awaitingDate.includes(e))
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

  // Compute total fees invested
  const totalFees = exams.reduce((acc, curr) => {
    const raw = curr.applicationFee.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadJsonToFirebase(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO COMMAND DECK */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-7 sm:p-11 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Top Status Indicators */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>2026–2027 Indian Recruitment Command Center</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span>Firebase: exam-tracker-42bc0</span>
            </div>

            {currentUser ? (
              <button
                onClick={onOpenProfileModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium cursor-pointer transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{candidateName}</span>
                <span className="text-emerald-400/60">•</span>
                <span className="text-[11px] underline">View Profile</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer transition-all"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {currentUser ? (
              <>
                <span className="block text-xl sm:text-2xl font-semibold text-indigo-300 mb-1">
                  Welcome back, {candidateName}
                </span>
                Targeting <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-amber-200 bg-clip-text text-transparent">{total} Recruitments</span>
              </>
            ) : (
              <>
                Centralized Command For All{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-amber-200 bg-clip-text text-transparent">
                  {total} Competitive Recruitments
                </span>
              </>
            )}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            {currentUser ? (
              <>Active focus: <strong className="text-white font-medium">{targetCategory}</strong>. Your exams, deadlines, scorecards, and milestones are isolated to your private account and synchronized to Google Cloud Firestore.</>
            ) : (
              <>Live operations portal for Banking (IBPS & SBI), Scientific Research (ISRO ICRB & BARC), Engineering (GATE & PSU Cadres), and Delhi Technical Staff (DSSSB). Track confirmed dates, manage admit cards, record exam outcomes, and store everything in Cloud Firestore with bidirectional JSON portability.</>
            )}
          </p>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('master')}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Explore All {total} Vacancies</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Fast 1-Click Move to Firebase Button */}
            <button
              onClick={onMoveDataToFirebase}
              disabled={isSyncingFirebase}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSyncingFirebase ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <CloudUpload className="w-4 h-4 text-slate-950" />
              )}
              <span>Move Data to Firebase</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Visual Roadmap</span>
            </button>

            <button
              onClick={() => exportCategorizedJson(exams)}
              className="px-3.5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
              title="Download structured JSON"
            >
              <Download className="w-4 h-4 text-indigo-300" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. STATS & CATEGORY BREAKDOWN CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Confirmed */}
        <div 
          onClick={() => setActiveTab('master')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tracked</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{total}</span>
            <span className="text-xs text-indigo-600 font-bold">100% Applied</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">₹{totalFees.toLocaleString('en-IN')} Total Fee Pool</p>
        </div>

        {/* Upcoming Active */}
        <div 
          onClick={() => setActiveTab('master')}
          className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Upcoming Active</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-sans">{upcomingActive.length}</span>
            <span className="text-xs text-emerald-600 font-bold">#1 to #{upcomingActive.length}</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Oct 2026 – Feb 2027 window</p>
        </div>

        {/* Awaiting Date */}
        <div 
          onClick={() => setActiveTab('master')}
          className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Date TBA</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-sans">{awaitingDate.length}</span>
            <span className="text-xs text-amber-700 font-bold">Watchlist</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">DSSSB (4 posts) & SSC CHSL</p>
        </div>

        {/* Completed - Result Awaited */}
        <div 
          onClick={() => setActiveTab('master')}
          className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Result Awaited</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700 font-sans">{completedAwaited.length}</span>
            <span className="text-xs text-blue-600 font-bold">Attempted</span>
          </div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">SBI Clerk, CIL, IOCL, RSSB</p>
        </div>

        {/* Completed - Result Announced */}
        <div 
          onClick={() => setActiveTab('master')}
          className="col-span-2 md:col-span-1 bg-white p-5 rounded-2xl border border-rose-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Result Declared</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700 font-sans">{completedAnnounced.length}</span>
            <span className="text-xs text-rose-600 font-bold">Archived</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-1 font-medium">GATE, BARC, SEBI, SBI PO</p>
        </div>
      </section>

      {/* 3. FIREBASE CLOUD & DATA MIGRATION SECTION */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-indigo-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Move & Synchronize User Data to Firebase Firestore</span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Seamlessly persist your application records, milestones, scorecards, and timeline stages to Google Firebase Firestore under project <strong className="font-mono text-amber-300">exam-tracker-42bc0</strong>.
            </p>
          </div>

          {/* Cloud Auth and Status Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${lastSyncedAt ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-slate-300">Last Synced:</span>
              <span className="font-mono font-bold text-amber-300">{lastSyncedAt || 'Not yet synced'}</span>
            </div>

            <button
              onClick={onOpenFirebaseModal}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 cursor-pointer flex items-center gap-1.5"
            >
              <span>Manage Credentials</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Step Interactive Migration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Authentication */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-indigo-300 uppercase tracking-wider">Step 1 • Identity & Auth</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  currentUser ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {currentUser ? 'Ready' : 'Local'}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">Firebase Authentication</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentUser 
                  ? `Signed in as ${currentUser.displayName || currentUser.email || 'Guest User'}` 
                  : 'Authenticate with Google, Email/Password, or continue seamlessly as Guest.'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-300 truncate max-w-[150px]">
                    {currentUser.email || 'Guest Session'}
                  </span>
                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      className="text-xs text-rose-300 hover:text-rose-200 cursor-pointer flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  {onQuickGoogleSignIn && (
                    <button
                      onClick={onQuickGoogleSignIn}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Google Login
                    </button>
                  )}
                  {onQuickGuestSignIn && (
                    <button
                      onClick={onQuickGuestSignIn}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-center"
                    >
                      Guest Login
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Push Data to Firestore */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-amber-300 uppercase tracking-wider">Step 2 • Cloud Sync</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {exams.length} Items Ready
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">Move Local Records to Firestore</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Writes all 31 exams, categorized summaries, and active milestones to the Cloud Firestore database collection.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={onMoveDataToFirebase}
                disabled={isSyncingFirebase}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-60"
              >
                {isSyncingFirebase ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4" />
                )}
                <span>{isSyncingFirebase ? 'Writing to Firestore...' : 'Move to Firebase Now'}</span>
              </button>
            </div>
          </div>

          {/* Step 3: JSON Direct Upload to Firestore */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-purple-300 uppercase tracking-wider">Step 3 • JSON Pipeline</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Direct Upload
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">Upload JSON Directly to Cloud</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Select any backup or 4-category JSON file; validate and write straight to your Firestore account.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10">
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                disabled={isSyncingFirebase}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/20 disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
                <span>Upload JSON to Firestore</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. IMMEDIATE SCHEDULE: NEXT UPCOMING ACTIVE EXAMS (#1 to #4) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Immediate Upcoming Examinations Schedule
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active test dates in chronological order (#1 to #15). Verify syllabus, check call letters, and log completion outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Full Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('master')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View All 15</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Next 4 Key Upcoming Exams Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingActive.slice(0, 4).map((exam) => (
            <div
              key={exam.id}
              className="p-5 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-extrabold text-xs shadow-2xs">
                    #{exam.displayOrder}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {exam.statusTag || 'Confirmed'}
                  </span>
                </div>

                <h3 
                  onClick={() => onSelectExam(exam)}
                  className="font-extrabold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors leading-snug"
                >
                  {exam.examName}
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-1">{exam.postTitle}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{exam.organization}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Exam Date:</span>
                    <span className="font-mono font-bold text-slate-900">{exam.examDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fee:</span>
                    <span className="font-mono font-bold text-slate-800">{exam.applicationFee} ({exam.feeStatus})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Stage:</span>
                    <span className="font-semibold text-indigo-700">{exam.timelineStage}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {onOpenCompleteModal && (
                  <button
                    onClick={() => onOpenCompleteModal(exam)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}

                {exam.sourceUrl && (
                  <a
                    href={exam.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-600 p-1"
                    title="Open official portal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WORKFLOW & TOOLS SHOWCASE */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-white">Full-Spectrum Tracker Capabilities</h2>
          <p className="text-xs text-slate-400 mt-0.5">Explore each dedicated module tailored for competitive recruitment success</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveTab('master')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <FileText className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-sm text-white">Master Tracker</h3>
            <p className="text-xs text-slate-300 mt-1">Search, filter by category or priority, sort #1–#15, and view full specifications.</p>
          </div>

          <div 
            onClick={() => setActiveTab('stageTracker')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <ShieldCheck className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-sm text-white">Stage Matrix</h3>
            <p className="text-xs text-slate-300 mt-1">Live checklist for Application, Admit Card, Attempted, Answer Key, and Result.</p>
          </div>

          <div 
            onClick={() => setActiveTab('calendar')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <Calendar className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-sm text-white">Milestone Calendar</h3>
            <p className="text-xs text-slate-300 mt-1">Dynamic monthly scheduler showing multi-day CBT exams and TBA watchlists.</p>
          </div>

          <div 
            onClick={() => setActiveTab('timeline')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <GitCommit className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-sm text-white">Visual Pipeline</h3>
            <p className="text-xs text-slate-300 mt-1">Progressive 7-stage visual pipeline from application submission to final appointment.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
