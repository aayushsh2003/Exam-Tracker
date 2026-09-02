import React from 'react';
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
  Clock,
  Briefcase
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
  onResetData,
  onOpenAiAdvisor,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const totalExams = exams.length;
  const completedExams = exams.filter(e => e.status === 'Completed' || e.timelineStage === 'Exam Completed').length;
  const highPriority = exams.filter(e => e.priority === 'Very High' || e.priority === 'High').length;

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  2026 Exam Tracker
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Confirmed: {totalExams} Posts
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
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
              <span>AI Exam Strategist</span>
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

            {/* Export Dropdown / Menu */}
            <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
              <button
                id="btn-export-csv"
                onClick={onExportCsv}
                title="Export to Excel / CSV"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <label
                htmlFor="json-import-input"
                title="Import backup JSON"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <input
                  id="json-import-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={onImportJson}
                />
              </label>

              <button
                id="btn-reset-data"
                onClick={onResetData}
                title="Restore default 2026 dataset"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
