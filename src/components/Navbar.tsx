import React, { useRef } from 'react';
import { 
  Home,
  Layers, 
  Table, 
  GitCommit, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Bookmark, 
  Sparkles, 
  Plus, 
  Download, 
  Upload, 
  CheckCircle2,
  Briefcase,
  Database,
  Cloud,
  User as UserIcon
} from 'lucide-react';
import { ActiveTab, ExamItem, UserProfile } from '../types';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  exams: ExamItem[];
  onAddNewExam: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenBackupModal: () => void;
  onOpenFirebaseModal: () => void;
  onResetData: () => void;
  onOpenAiAdvisor: () => void;
  currentUser: User | null;
  userProfile: UserProfile | null;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  lastSyncedAt: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  exams,
  onAddNewExam,
  onExportCsv,
  onExportJson,
  onImportJson,
  onOpenBackupModal,
  onOpenFirebaseModal,
  onResetData,
  onOpenAiAdvisor,
  currentUser,
  userProfile,
  onOpenProfileModal,
  onOpenAuthModal,
  lastSyncedAt,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalExams = exams.length;
  const completedExams = exams.filter(e => e.status === 'Completed' || e.timelineStage === 'Exam Completed' || e.isCompleted).length;

  const displayName = userProfile?.displayName || currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : '');
  const getInitials = () => {
    if (displayName) {
      const parts = displayName.trim().split(' ');
      return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }
    return 'U';
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'master', label: 'Master Tracker', icon: <Table className="w-4 h-4" />, badge: `${totalExams}` },
    { id: 'dashboard', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <GitCommit className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'actions', label: 'Action Plan', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'stageTracker', label: 'Stage Tracker', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'references', label: 'References & Docs', icon: <Bookmark className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20 shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  Exam Command Center
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
                  {totalExams} Posts
                </span>
                {completedExams > 0 && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden md:inline-block">
                    {completedExams} Done
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden lg:block">
                31 Tracked Recruitments • Firestore Cloud Sync • JSON Portability
              </p>
            </div>
          </div>

          {/* Action Hub & Live Summary */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Profile / Auth Button */}
            {currentUser ? (
              <button
                onClick={onOpenProfileModal}
                title={`Logged in as ${displayName || currentUser.email}. Click to view & edit Profile`}
                className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white transition-all cursor-pointer shadow-xs group"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white group-hover:scale-105 transition-transform">
                  {getInitials()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-xs block leading-tight max-w-[100px] truncate">
                    {displayName || 'My Profile'}
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Firebase Cloud Sync Button */}
            <button
              onClick={onOpenFirebaseModal}
              title={currentUser ? `Connected as ${currentUser.email || 'Guest'}. Click to sync Firestore` : 'Click to connect Firebase Firestore'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-2xs"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Firebase Sync</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* AI Advisor Button */}
            <button
              id="btn-ai-advisor"
              onClick={onOpenAiAdvisor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden md:inline">AI Strategist</span>
            </button>

            {/* Quick Add Exam */}
            <button
              id="btn-add-exam-nav"
              onClick={onAddNewExam}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Add Post</span>
            </button>

            {/* Data Management Hub & JSON Actions */}
            <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
              {/* Quick Download JSON Button */}
              <button
                id="btn-download-json"
                onClick={onExportJson}
                title="Download data in JSON format (.json)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xl:inline font-mono">JSON</span>
              </button>

              {/* Quick Upload JSON Button */}
              <label
                htmlFor="json-import-input-nav"
                title="Upload data in JSON format (.json)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline font-mono">Upload</span>
                <input
                  id="json-import-input-nav"
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={onImportJson}
                />
              </label>

              {/* Central Backup Hub Modal Trigger */}
              <button
                id="btn-open-backup-modal"
                onClick={onOpenBackupModal}
                title="Open Data Backup & JSON Management Hub"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none" aria-label="Tabs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-indigo-700/80 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
