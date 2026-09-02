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
  CheckCircle
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
  const completedExamsList = exams.filter(e => e.status === 'Completed' || e.timelineStage === 'Exam Completed' || e.isCompleted);
  const completed = completedExamsList.length;
  const veryHigh = exams.filter(e => e.priority === 'Very High').length;
  const high = exams.filter(e => e.priority === 'High').length;
  const tbaCount = exams.filter(e => e.examDate.includes('TBA')).length;

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
              2026 Competitive Exam Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Applied Exams & Recruitment Master Portal
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Consolidated intelligence for all 20 applied government, PSU, scientific, regulatory, and teaching vacancies. Current reference date: <span className="font-mono text-amber-300 font-semibold">01-Sep-2026</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-view-master-hero"
              onClick={() => setActiveTab('master')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>Explore All {total} Posts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="btn-view-timeline-hero"
              onClick={() => setActiveTab('timeline')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Visual Roadmap</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid effect */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Confirmed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed Posts</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{total}</span>
            <span className="text-xs text-emerald-600 font-medium">100% applied</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Includes DSSSB, IBPS, SBI, ISRO</p>
        </div>

        {/* Completed Exams */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attempted / Done</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-sans">{completed}</span>
            <span className="text-xs text-slate-500">of {total} completed</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">RSSB Instructor (23-Aug)</p>
        </div>

        {/* High Priority Focus */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High / V.High Priority</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 font-sans">{veryHigh + high}</span>
            <span className="text-xs text-rose-500 font-medium">{veryHigh} V.High</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Key technical & officer roles</p>
        </div>

        {/* Document Readiness */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doc Vault Ready</span>
            <span className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
              <FolderLock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-700 font-sans">{docReadinessPct}%</span>
            <span className="text-xs text-slate-500">{totalDocsReady}/{totalDocsPossible}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${docReadinessPct}%` }}></div>
          </div>
        </div>

        {/* Pending Dates (TBA) */}
        <div className="col-span-2 sm:col-span-1 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates on Watchlist</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-sans">{tbaCount}</span>
            <span className="text-xs text-slate-500">TBA notices</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-1 font-medium">Daily notice monitor</p>
        </div>
      </div>

      {/* Completed Exams & Scorecard Hub */}
      {completedExamsList.length > 0 && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-emerald-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  Completed Exams & Scorecard Hub
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {completedExamsList.length} Logged
                  </span>
                </h3>
                <p className="text-xs text-slate-600">Recorded attempts, evaluated scores, and stage advancement outcomes</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('master')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View all completed in Master Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {completedExamsList.map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-xl border border-emerald-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 
                      onClick={() => onSelectExam(exam)}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5"
                    >
                      {exam.examName}
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                      {exam.completedDate || exam.examDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{exam.postTitle}</p>
                  <p className="text-[11px] text-slate-500">{exam.organization}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Score / Marks</span>
                      <span className="font-bold text-slate-900 font-mono text-xs">{exam.scoreMarks || 'Evaluated'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Outcome</span>
                      <span className="font-semibold text-emerald-800 text-xs truncate block">{exam.completionOutcome || 'Attempted'}</span>
                    </div>
                  </div>

                  {exam.completionNotes && (
                    <p className="mt-2 text-[11px] text-slate-600 italic bg-emerald-50/50 p-2 rounded border border-emerald-100 line-clamp-2">
                      "{exam.completionNotes}"
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectExam(exam)}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-600"
                  >
                    View Specs
                  </button>
                  {onOpenCompleteModal && (
                    <button
                      onClick={() => onOpenCompleteModal(exam)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors"
                    >
                      Update Result
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Milestone Countdowns & Schedule Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Immediate Deadlines and Dates */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Immediate Milestones & Upcoming Dates</h3>
                <p className="text-xs text-slate-500">Time-sensitive deadlines and scheduled test phases</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {upcomingMilestones.slice(0, 4).map((m) => {
              const countdown = getDaysRemaining(m.dateIso);
              const related = exams.find(e => e.id === m.relatedExamId);

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all group relative cursor-pointer"
                  onClick={() => related && onSelectExam(related)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {m.date}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        countdown.isToday
                          ? 'bg-rose-500 text-white animate-pulse'
                          : countdown.days <= 7
                          ? 'bg-rose-100 text-rose-700'
                          : countdown.days <= 30
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {countdown.text}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                    {m.examPost}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">{m.milestone}</p>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{m.action}</p>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Click to view post specs</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice for Completed Exam */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-500 text-white">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-emerald-900">Completed Milestone: RSSB Basic Computer Instructor</span>
                <p className="text-[11px] text-emerald-700">Exam completed on 23-Aug-2026. Official answer key & score calculation in progress.</p>
              </div>
            </div>
            <button
              onClick={() => {
                const item = exams.find(e => e.id === 'rssb-basic-comp-inst');
                if (item) onSelectExam(item);
              }}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 px-2 py-1"
            >
              Details
            </button>
          </div>
        </div>

        {/* Category Breakdown & Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Domain Distribution</h3>
              <p className="text-xs text-slate-500">20 Confirmed Applications by sector</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(categoriesCount).map(([cat, countVal]) => {
              const count = Number(countVal) || 0;
              const pct = Math.round((count / total) * 100);
              const colorInfo = getCategoryBadgeColor(cat);

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

          {/* Quick AI Strategy Callout */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-purple-950 text-white">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Preparation Strategist</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              Get targeted syllabus breakdown, clash management, and revision plans between Banking, DSSSB CS, and ISRO.
            </p>
            <button
              onClick={() => setActiveTab('aiAdvisor')}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors text-center"
            >
              Launch AI Advisor →
            </button>
          </div>
        </div>
      </div>

      {/* Confirmed Posts High-Yield Quick Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Key Technical & Officer Posts (Priority Watch)</h3>
            <p className="text-xs text-slate-500">Click any card to inspect full qualification specs, fee status, and syllabus tips</p>
          </div>
          <button
            onClick={() => setActiveTab('master')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View all 20 applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {exams.filter(e => e.priority === 'Very High').map((exam) => {
            const catBadge = getCategoryBadgeColor(exam.category);
            const priBadge = getPriorityBadgeColor(exam.priority);

            return (
              <div
                key={exam.id}
                onClick={() => onSelectExam(exam)}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {exam.examName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                      {exam.priority}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mt-1">{exam.postTitle}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{exam.organization}</p>

                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
                      {exam.category}
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {exam.examDate}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
                    {exam.keyPrep}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Stage: <strong className="text-slate-800">{exam.timelineStage}</strong></span>
                  <span className="font-semibold text-indigo-600 group-hover:underline">Inspect →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
