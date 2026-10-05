import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  Clock, 
  Save, 
  ShieldCheck, 
  Cloud, 
  Database, 
  LogOut, 
  RotateCcw, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Sliders,
  Award,
  Layers,
  FileText,
  IndianRupee
} from 'lucide-react';
import { UserProfile, ExamItem, MilestoneAction, ActiveTab } from '../types';
import { exportCategorizedJson } from '../utils/exportUtils';
import { User as FirebaseUser } from 'firebase/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  onSaveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => Promise<void>;
  onOpenAuthModal: () => void;
  onResetUserData: () => void;
  exams: ExamItem[];
  milestones: MilestoneAction[];
  lastSyncedAt: string | null;
  onToast: (msg: string) => void;
}

const TARGET_STREAMS = [
  'Computer Science & IT',
  'Banking & Financial Services (IBPS / SBI / SEBI)',
  'Scientific & Space Research (ISRO / BARC)',
  'Engineering & PSU Cadres (GATE / CIL / IOCL / AAI)',
  'Delhi & State Administrative (DSSSB / RSSB / SSC)',
  'All National Competitive Recruitments'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onSaveProfile,
  onSignOut,
  onOpenAuthModal,
  onResetUserData,
  exams,
  milestones,
  lastSyncedAt,
  onToast,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [targetCategory, setTargetCategory] = useState(TARGET_STREAMS[0]);
  const [targetExamYear, setTargetExamYear] = useState('2026–2027');
  const [bio, setBio] = useState('');
  const [autoSyncCloud, setAutoSyncCloud] = useState(true);
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || currentUser?.displayName || '');
      setTargetCategory(userProfile.targetCategory || TARGET_STREAMS[0]);
      setTargetExamYear(userProfile.targetExamYear || '2026–2027');
      setBio(userProfile.bio || '');
      if (userProfile.preferences) {
        setAutoSyncCloud(userProfile.preferences.autoSyncCloud ?? true);
        setNotifyDeadlines(userProfile.preferences.notifyUpcomingDeadlines ?? true);
      }
    } else if (currentUser) {
      setDisplayName(currentUser.displayName || currentUser.email?.split('@')[0] || '');
    }
  }, [userProfile, currentUser]);

  if (!isOpen) return null;

  const totalExams = exams.length;
  const completedExams = exams.filter(e => e.isCompleted || e.status === 'Completed' || (e.statusTag && (e.statusTag.includes('completed') || e.statusTag.includes('Qualified')))).length;
  const activeUpcoming = exams.filter(e => !e.isCompleted && e.status !== 'Completed' && !e.categoryGroup?.includes('completed')).length;

  const totalFees = exams.reduce((sum, e) => {
    const raw = e.applicationFee.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProfile({
        displayName,
        targetCategory,
        targetExamYear,
        bio,
        preferences: {
          autoSyncCloud,
          notifyUpcomingDeadlines: notifyDeadlines,
          defaultView: 'home',
          targetCategory,
          targetExamYear
        }
      });
      onToast('Profile updated & synchronized to Cloud Firestore!');
      onClose();
    } catch (err: any) {
      onToast(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (displayName.trim()) {
      const parts = displayName.trim().split(' ');
      return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-500/30 border border-white/20">
                {getInitials()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight text-white">
                    {displayName || currentUser?.displayName || 'User Profile & Identity'}
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentUser ? (currentUser.isAnonymous ? 'Guest Account' : 'Authenticated') : 'Local Account'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{currentUser?.email || 'No email attached (Local workspace)'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50/50">
          
          {/* USER RECRUITMENT STATS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Total Exams</span>
              <span className="text-2xl font-extrabold text-slate-900 font-sans mt-0.5 block">{totalExams}</span>
              <span className="text-[10px] text-indigo-600 font-semibold">100% In My List</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Active & Upcoming</span>
              <span className="text-2xl font-extrabold text-emerald-700 font-sans mt-0.5 block">{activeUpcoming}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Scheduled Tests</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Completed</span>
              <span className="text-2xl font-extrabold text-blue-700 font-sans mt-0.5 block">{completedExams}</span>
              <span className="text-[10px] text-blue-600 font-semibold">Logged Outcomes</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">My Fee Pool</span>
              <span className="text-2xl font-extrabold text-slate-900 font-sans mt-0.5 block">₹{totalFees.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-purple-600 font-semibold">Total Invested</span>
            </div>
          </div>

          {/* EDIT PROFILE FORM */}
          <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Personal Preferences & Target Strategy
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">UID: {currentUser ? currentUser.uid.slice(0, 10) + '...' : 'local-user'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name / Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Aayush Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Target Stream */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Primary Target Domain</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TARGET_STREAMS.map(stream => (
                    <option key={stream} value={stream}>{stream}</option>
                  ))}
                </select>
              </div>

              {/* Target Exam Year */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Target Year / Recruitment Window</label>
                <input
                  type="text"
                  value={targetExamYear}
                  onChange={(e) => setTargetExamYear(e.target.value)}
                  placeholder="e.g. 2026–2027"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Account Status / Cloud Sync Toggle */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Cloud Firestore Integration</label>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-slate-700 font-medium">Auto-sync modifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSyncCloud}
                    onChange={(e) => setAutoSyncCloud(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Preparation Bio / Ambition Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Personal Target Note / Strategy Manifesto</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="e.g. Aiming for Top 100 in GATE 2027 CS & clearing ISRO Scientist 'SC'. Daily mock schedule: 6 hours."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>

          {/* PER-USER DATA CONTROLS & ISOLATION */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Isolated Data Workspace Controls</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every user account maintains its own isolated database of exams, milestones, and scores. Your edits do not affect other users.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => exportCategorizedJson(exams)}
                className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                <span>Export My Exams (JSON)</span>
              </button>

              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset My Workspace</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <span className="font-semibold text-[11px]">Reset your exams to default 31 template?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetUserData();
                      setShowResetConfirm(false);
                    }}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 rounded bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CLOUD FIRESTORE METADATA BADGE */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>Cloud Project: <strong className="font-mono">exam-tracker-42bc0</strong></span>
              <span className="text-slate-400">•</span>
              <span>Firestore Sync: <strong className="font-semibold text-emerald-700">{lastSyncedAt || 'Active'}</strong></span>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={onSignOut}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser.displayName || currentUser.email?.split('@')[0] || 'User'})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer underline"
              >
                Sign In to Save to Your Cloud Account
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500">
            <span>Data secured with Firebase ABAC rules • Developed by </span>
            <a
              href="https://aayush-ki-pehchan.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-bold underline transition-colors"
            >
              Aayush Sharma (Aayush Ki Pehchan)
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-end sm:self-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
