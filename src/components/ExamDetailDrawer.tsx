import React from 'react';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Award, 
  FolderLock, 
  CheckSquare, 
  Square,
  BookOpen,
  BarChart2,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { ExamItem } from '../types';
import { getPriorityBadgeColor, getCategoryBadgeColor } from '../utils/dateHelpers';

interface ExamDetailDrawerProps {
  exam: ExamItem | null;
  onClose: () => void;
  onEdit: (exam: ExamItem) => void;
  onDelete: (id: string) => void;
  onOpenAiAdvisor: (exam: ExamItem) => void;
  onUpdateExam: (updated: ExamItem) => void;
  onOpenCompleteModal?: (exam: ExamItem) => void;
}

export const ExamDetailDrawer: React.FC<ExamDetailDrawerProps> = ({
  exam,
  onClose,
  onEdit,
  onDelete,
  onOpenAiAdvisor,
  onUpdateExam,
  onOpenCompleteModal,
}) => {
  if (!exam) return null;

  const isCompleted = exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted;
  const priBadge = getPriorityBadgeColor(exam.priority);
  const catBadge = getCategoryBadgeColor(exam.category);

  const toggleDocItem = (docKey: keyof ExamItem['documentsReady']) => {
    const updated: ExamItem = {
      ...exam,
      documentsReady: {
        ...exam.documentsReady,
        [docKey]: !exam.documentsReady[docKey],
      },
    };
    onUpdateExam(updated);
  };

  const toggleStageItem = (stageKey: keyof ExamItem['stageStatus']) => {
    const updated: ExamItem = {
      ...exam,
      stageStatus: {
        ...exam.stageStatus,
        [stageKey]: !exam.stageStatus[stageKey],
      },
    };
    onUpdateExam(updated);
  };

  const docList: { key: keyof ExamItem['documentsReady']; label: string }[] = [
    { key: 'applicationPdf', label: 'Application Form PDF (Saved & Printed)' },
    { key: 'feeReceipt', label: 'E-Payment Challan / Fee Receipt' },
    { key: 'idProof', label: 'Valid Govt Photo ID (Aadhaar/PAN/Voter)' },
    { key: 'degreeCerts', label: '10th, 12th, B.Tech/Degree Marksheets' },
    { key: 'admitCard', label: 'Downloaded Official Admit Card & Photo pasted' },
  ];

  const stageList: { key: keyof ExamItem['stageStatus']; label: string }[] = [
    { key: 'applicationConfirmed', label: 'Application Submitted & Confirmed' },
    { key: 'admitCardDownloaded', label: 'Admit Card Downloaded' },
    { key: 'examAttempted', label: 'Exam / CBT Attempted' },
    { key: 'answerKeyChecked', label: 'Answer Key & Marks Calculated' },
    { key: 'resultAnnounced', label: 'Result Announced' },
    { key: 'nextStageQualified', label: 'Qualified for Next Stage / DV' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                {exam.priority} Priority
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {exam.category}
              </span>
              {isCompleted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Exam Completed
                </span>
              )}
              {exam.advertisementNo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Advt: {exam.advertisementNo}
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">{exam.examName}</h2>
            <p className="text-sm font-semibold text-slate-300 mt-1">{exam.postTitle}</p>
            <p className="text-xs text-slate-400">{exam.organization}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {/* Complete Exam Action Card / Dossier */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isCompleted 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-sm' 
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl mt-0.5 ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {isCompleted ? 'Exam Completed & Logged' : 'Exam Completion Tracker'}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {isCompleted 
                      ? `Attempt recorded on ${exam.completedDate || exam.examDate}. Click to update marks, cutoffs or outcome.`
                      : 'Have you attempted this exam? Click to record marks, outcome, and reflections.'}
                  </p>
                </div>
              </div>

              {onOpenCompleteModal && (
                <button
                  onClick={() => onOpenCompleteModal(exam)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm transition-all flex items-center gap-1.5 ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isCompleted ? 'Edit Score/Outcome' : 'Complete Exam'}</span>
                </button>
              )}
            </div>

            {/* If completed, show detailed marks & outcome card */}
            {isCompleted && (
              <div className="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Marks / Score</span>
                  <span className="font-bold text-emerald-900 font-mono text-xs mt-0.5 block">
                    {exam.scoreMarks || 'Evaluated / Logged'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Outcome Status</span>
                  <span className="font-semibold text-emerald-900 text-xs mt-0.5 block truncate">
                    {exam.completionOutcome || 'Attempted - Awaiting Result'}
                  </span>
                </div>
                {exam.completionNotes && (
                  <div className="col-span-2 p-2.5 rounded-xl bg-white/80 border border-emerald-100 text-[11px] text-slate-700">
                    <span className="font-bold text-slate-800 block text-[10px] uppercase">Post-Exam Notes:</span>
                    <p className="mt-0.5 line-clamp-2 italic">{exam.completionNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick AI Strategy CTA */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
            <div>
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI Exam Strategist</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Generate tailored syllabus breakdown and mock schedule for {exam.examName}.
              </p>
            </div>
            <button
              onClick={() => onOpenAiAdvisor(exam)}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap shadow-sm"
            >
              Ask AI →
            </button>
          </div>

          {/* Key Dates & Fee Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Schedule & Financial Ledger
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Exam Date</span>
                <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">{exam.examDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Admit Card</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{exam.admitCard}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Application Fee</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{exam.applicationFee} ({exam.feeStatus})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Current Stage</span>
                <span className="font-bold text-indigo-600 mt-0.5 block">{exam.timelineStage}</span>
              </div>
            </div>
          </div>

          {/* Eligibility & Selection Process */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Eligibility & Selection Process
            </h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-900 block">Minimum Qualification:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {exam.minQualification}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block">Selection Stages:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {exam.selectionProcess}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block">Key Preparation Strategy:</span>
                <p className="text-indigo-900 mt-0.5 leading-relaxed bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 italic">
                  {exam.keyPrep}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Document Readiness Locker */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FolderLock className="w-4 h-4 text-teal-600" />
                Document Dossier Checklist
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">
                {Object.values(exam.documentsReady).filter(Boolean).length} / {docList.length} Ready
              </span>
            </div>

            <div className="space-y-2">
              {docList.map((doc) => {
                const isReady = exam.documentsReady[doc.key];
                return (
                  <div
                    key={doc.key}
                    onClick={() => toggleDocItem(doc.key)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 text-xs ${
                      isReady
                        ? 'bg-teal-50/50 border-teal-200 text-teal-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    <button className="text-teal-600">
                      {isReady ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <span className={isReady ? 'font-medium' : ''}>{doc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Progress Matrix */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Stage Matrix Progress
            </h3>

            <div className="space-y-2">
              {stageList.map((st) => {
                const isDone = exam.stageStatus[st.key];
                return (
                  <div
                    key={st.key}
                    onClick={() => toggleStageItem(st.key)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isDone
                        ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-300" />
                      )}
                      <span className={isDone ? 'font-bold' : ''}>{st.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isDone ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {isDone ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes & Reminders */}
          {exam.notes && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
              <strong className="block font-bold">Important Notes / Reminders:</strong>
              <p className="leading-relaxed">{exam.notes}</p>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (confirm(`Delete post "${exam.examName}" from master database?`)) {
                onDelete(exam.id);
                onClose();
              }
            }}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenCompleteModal && (
              <button
                onClick={() => onOpenCompleteModal(exam)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isCompleted 
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCompleted ? 'Edit Completion' : 'Mark Completed'}</span>
              </button>
            )}

            <button
              onClick={() => onEdit(exam)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
