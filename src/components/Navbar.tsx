import React, { useRef } from 'react';
import { 
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
  RotateCcw,
  CheckCircle2,
  Briefcase,
  FileJson,
  Database
} from 'lucide-react';
import { ActiveTab, ExamItem } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  exams: ExamItem[];
  onAddNewExam: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenBackupModal: () => void;
  onResetData: () => void;
  onOpenAiAdvisor: () => void;
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
  onResetData,
  onOpenAiAdvisor,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalExams = exams.length;
  const completedExams = exams.filter(e => e.status === 'Completed' || e.timelineStage === 'Exam Completed' || e.isCompleted).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
    { id: 'master', label: 'Master Tracker', icon: <Table className="w-4 h-4" />, badge: `${totalExams}` },
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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20 shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  2026 Exam Tracker
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
                Master Database • Timeline • Milestones • Stage Matrix • Reference Vault
              </p>
            </div>
          </div>

          {/* Action Hub & Live Summary */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Advisor Button */}
            <button
              id="btn-ai-advisor"
              onClick={onOpenAiAdvisor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI Exam Strategist</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Quick Add Exam */}
            <button
              id="btn-add-exam-nav"
              onClick={onAddNewExam}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
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
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xl:inline font-mono">JSON</span>
              </button>

              {/* Quick Upload JSON Button */}
              <label
                htmlFor="json-import-input-nav"
                title="Upload data in JSON format (.json)"
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 transition-colors cursor-pointer"
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

              {/* Data Backup Modal Opener */}
              <button
                id="btn-open-backup-modal"
                onClick={onOpenBackupModal}
                title="Open Data Backup & JSON Management Center"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Database className="w-4 h-4" />
              </button>

              {/* Reset Data */}
              <button
                id="btn-reset-data"
                onClick={onResetData}
                title="Restore default 2026 dataset"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors hidden sm:block"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu (Matching Excel Tabs) */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80 -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400'
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
    </header>
  );
};

