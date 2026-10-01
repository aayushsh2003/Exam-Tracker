import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  FolderLock, 
  Compass, 
  CheckCircle,
  Layers,
  XCircle
} from 'lucide-react';
import { ExamItem, MilestoneAction, ActiveTab } from '../types';
import { getDaysRemaining, getPriorityBadgeColor, getCategoryBadgeColor } from '../utils/dateHelpers';

interface DashboardViewProps {
  exams: ExamItem[];
  milestones: MilestoneAction[];
  onSelectExam: (exam: ExamItem) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAiAdvisorForExam?: (exam: ExamItem) => void;
  onOpenCompleteModal?: (exam: ExamItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  exams,
  milestones,
  onSelectExam,
  setActiveTab,
  onOpenAiAdvisorForExam,
  onOpenCompleteModal,
}) => {
  const total = exams.length;
  
  const completedAnnounced = exams.filter(
    e => e.categoryGroup === 'completedAnnounced' || (e.statusTag && e.statusTag.includes('Not Qualified'))
  );
  const completedAwaited = exams.filter(
    e => e.categoryGroup === 'completedAwaited' || (e.statusTag && (e.statusTag.includes('awaited') || e.statusTag.includes('next stage')))
  );
  const awaitingDate = exams.filter(
    e => e.categoryGroup === 'awaitingDate' || (e.statusTag && e.statusTag.includes('TBA')) || (!e.isCompleted && e.examDate.includes('TBA'))
  );
  const upcomingActive = exams.filter(
    e => !completedAnnounced.includes(e) && !completedAwaited.includes(e) && !awaitingDate.includes(e)
  );

  const completedExamsList = [...completedAwaited, ...completedAnnounced];
  const veryHigh = exams.filter(e => e.priority === 'Very High').length;
  const high = exams.filter(e => e.priority === 'High').length;

  // Calculate overall document readiness
  const totalDocsPossible = total * 5;
  const totalDocsReady = exams.reduce((acc, curr) => {
    const ready = Object.values(curr.documentsReady).filter(Boolean).length;
    return acc + ready;
  }, 0);
  const docReadinessPct = Math.round((totalDocsReady / (totalDocsPossible || 1)) * 100);

  // Group by categories
  const categoriesCount = exams.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // High priority upcoming milestones
  const upcomingMilestones = milestones
    .filter(m => !m.completed && m.dateIso)
    .sort((a, b) => (a.dateIso! > b.dateIso! ? 1 : -1));

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              2026–2027 Competitive Exam Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Applied Exams & Recruitment Master Portal
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Consolidated intelligence for all {total} recruitment vacancies across Banking, ISRO, SSC, RRB, DSSSB, and PSU engineering cadres.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('master')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All {total} Posts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Visual Roadmap</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid effect */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI 5-Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Confirmed */}
        <div 
          onClick={() => setActiveTab('master')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tracked</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{total}</span>
            <span className="text-xs text-indigo-600 font-medium">Vacancies</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">All applications registered</p>
        </div>

        {/* Upcoming Active */}
        <div 
          onClick={() => setActiveTab('master')}
          className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Upcoming Active</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-sans">{upcomingActive.length}</span>
            <span className="text-xs text-emerald-600 font-bold">Oct '26 – Feb '27</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Ranked #1 to #{upcomingActive.length}</p>
        </div>

        {/* Awaiting Date */}
        <div 
          onClick={() => setActiveTab('master')}
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Date TBA</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-sans">{awaitingDate.length}</span>
            <span className="text-xs text-amber-700 font-medium">Applied</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">DSSSB & SSC CHSL</p>
        </div>

        {/* Completed - Result Awaited */}
        <div 
          onClick={() => setActiveTab('master')}
          className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Result Awaited</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700 font-sans">{completedAwaited.length}</span>
            <span className="text-xs text-blue-600 font-medium">Attempted</span>
          </div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">SBI Clerk, CIL, IOCL, RSSB</p>
        </div>

        {/* Completed - Result Announced */}
        <div 
          onClick={() => setActiveTab('master')}
          className="col-span-2 sm:col-span-1 bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Result Declared</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700 font-sans">{completedAnnounced.length}</span>
            <span className="text-xs text-rose-600 font-medium">Archived</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-1 font-medium">GATE, BARC, SEBI, SBI PO</p>
        </div>
      </div>

      {/* Completed Exams & Scorecard Hub */}
      {completedExamsList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 bg-gradient-to-r from-slate-50/70 via-white to-blue-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 text-white">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  Completed Examinations & Outcomes
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                    {completedExamsList.length} Records
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  {completedAwaited.length} exams with result/next stage awaited • {completedAnnounced.length} exams with results announced
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('master')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Filter in Master Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {completedExamsList.map((exam) => {
              const isNotQual = exam.statusTag?.includes('Not Qualified');

              return (
                <div
                  key={exam.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isNotQual 
                      ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300' 
                      : 'border-blue-200 bg-blue-50/20 hover:border-blue-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 
                        onClick={() => onSelectExam(exam)}
                        className="font-bold text-sm text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {exam.examName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-mono">
                        {exam.prevExamDate || exam.completedDate || exam.examDate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{exam.postTitle}</p>
                    <p className="text-[11px] text-slate-500">{exam.organization}</p>

                    {/* Status Tag */}
                    <div className="mt-2.5">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isNotQual 
                          ? 'bg-rose-50 text-rose-800 border-rose-200' 
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {exam.statusTag || exam.result}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">Fee: {exam.applicationFee}</span>
                      {exam.sourceUrl && (
                        <a 
                          href={exam.sourceUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onSelectExam(exam)}
                      className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
                    >
                      View Details
                    </button>
                    {onOpenCompleteModal && (
                      <button
                        onClick={() => onOpenCompleteModal(exam)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Edit Outcome
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Grid: Upcoming Action Milestones & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Immediate Action Milestones */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>Immediate Schedule Milestones</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {upcomingMilestones.length} Pending
                </span>
              </h3>
              <p className="text-xs text-slate-500">Chronological exam milestones and tactical review checklist</p>
            </div>
            <button
              onClick={() => setActiveTab('actions')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {upcomingMilestones.slice(0, 6).map((m) => (
              <div key={m.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{m.examPost}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {m.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">{m.milestone}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{m.action}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  {m.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Category Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of applications by domain</p>

            <div className="mt-5 space-y-3.5">
              {Object.entries(categoriesCount).map(([cat, rawCount]) => {
                const count = Number(rawCount) || 0;
                const pct = Math.round((count / (total || 1)) * 100);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="font-mono text-slate-500">{count} post{count > 1 ? 's' : ''} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick AI Strategy Callout */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-purple-950 text-white">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Preparation Strategist</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              Get syllabus breakdown, clash management, and revision plans between Banking, CS, and ISRO.
            </p>
            <button
              onClick={() => setActiveTab('aiAdvisor')}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors text-center cursor-pointer"
            >
              Launch AI Advisor →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
