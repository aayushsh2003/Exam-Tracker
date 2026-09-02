import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Award, 
  Calendar, 
  FileText, 
  Sparkles, 
  RotateCcw, 
  CheckSquare, 
  Square,
  BarChart2,
  HelpCircle,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';
import { ExamItem, CompletionOutcomeType, TimelineStageType } from '../types';

interface CompleteExamModalProps {
  isOpen: boolean;
  exam: ExamItem | null;
  onClose: () => void;
  onSave?: (updatedExam: ExamItem) => void;
  onSaveCompletion?: (updatedExam: ExamItem) => void;
}

export const CompleteExamModal: React.FC<CompleteExamModalProps> = ({
  isOpen,
  exam,
  onClose,
  onSave,
  onSaveCompletion,
}) => {
  const isAlreadyCompleted = exam ? (exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted) : false;

  const [completedDate, setCompletedDate] = useState<string>(() => {
    if (exam?.completedDate) return exam.completedDate;
    if (exam?.examDate && !exam.examDate.includes('TBA')) return exam.examDate.split('(')[0].trim();
    return new Date().toISOString().split('T')[0];
  });

  const [scoreMarks, setScoreMarks] = useState<string>(exam?.scoreMarks || '');
  const [outcome, setOutcome] = useState<CompletionOutcomeType>(
    exam?.completionOutcome || (isAlreadyCompleted ? 'Attempted - Awaiting Result' : 'Attempted - Awaiting Result')
  );
  const [targetStage, setTargetStage] = useState<TimelineStageType>(
    exam?.timelineStage === 'Exam Completed' ? 'Exam Completed' : 'Exam Completed'
  );
  const [completionNotes, setCompletionNotes] = useState<string>(
    exam?.completionNotes || exam?.notes || ''
  );
  const [markAttempted, setMarkAttempted] = useState<boolean>(true);
  const [markAnswerKey, setMarkAnswerKey] = useState<boolean>(exam?.stageStatus?.answerKeyChecked || false);
  const [markResultAnnounced, setMarkResultAnnounced] = useState<boolean>(exam?.stageStatus?.resultAnnounced || false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    if (exam) {
      setCompletedDate(
        exam.completedDate || (exam.examDate && !exam.examDate.includes('TBA') ? exam.examDate.split('(')[0].trim() : new Date().toISOString().split('T')[0])
      );
      setScoreMarks(exam.scoreMarks || '');
      setOutcome(exam.completionOutcome || 'Attempted - Awaiting Result');
      setCompletionNotes(exam.completionNotes || exam.notes || '');
      setMarkAttempted(true);
      setMarkAnswerKey(exam.stageStatus?.answerKeyChecked || false);
      setMarkResultAnnounced(exam.stageStatus?.resultAnnounced || false);
    }
  }, [exam]);

  if (!isOpen || !exam) return null;

  const triggerConfettiAnimation = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const handleSave = (markAsDone: boolean = true) => {
    if (markAsDone) {
      triggerConfettiAnimation();
    }

    const updated: ExamItem = {
      ...exam,
      isCompleted: markAsDone,
      status: markAsDone ? 'Completed' : 'Applied',
      timelineStage: markAsDone ? targetStage : 'Application Submitted',
      completedDate: markAsDone ? completedDate : undefined,
      scoreMarks: markAsDone ? scoreMarks : undefined,
      completionOutcome: markAsDone ? outcome : undefined,
      completionNotes: markAsDone ? completionNotes : undefined,
      stageStatus: {
        ...exam.stageStatus,
        examAttempted: markAsDone ? markAttempted : false,
        answerKeyChecked: markAsDone ? markAnswerKey : false,
        resultAnnounced: markAsDone ? markResultAnnounced : false,
        nextStageQualified: markAsDone && outcome === 'Qualified for Next Stage / Mains',
      },
      updatedAt: new Date().toISOString(),
    };

    const saveCallback = onSaveCompletion || onSave;
    if (saveCallback) {
      saveCallback(updated);
    }

    setTimeout(() => {
      onClose();
    }, markAsDone ? 400 : 0);
  };

  const handleReopen = () => {
    if (confirm(`Revert "${exam.examName}" back to In-Progress / Scheduled status?`)) {
      handleSave(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Celebration Confetti Overlay */}
        {showConfetti && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-indigo-950/20">
            <div className="text-center p-6 bg-white/95 rounded-2xl shadow-2xl border border-emerald-300 animate-bounce">
              <span className="text-4xl">🎉 🎯 ✨</span>
              <p className="text-sm font-extrabold text-emerald-800 mt-2">Exam Successfully Completed!</p>
              <p className="text-xs text-slate-600">Milestone updated in your master tracker.</p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Award className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {isAlreadyCompleted ? 'Update Exam Completion Record' : 'Mark Exam as Completed'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{exam.examName}</h2>
            <p className="text-xs text-slate-300 mt-0.5">{exam.postTitle} • {exam.organization}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto bg-slate-50/50">
          {/* Status Indicator Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isAlreadyCompleted 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isAlreadyCompleted ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold">
                  {isAlreadyCompleted ? 'Status: Exam Completed & Logged' : 'Ready to record completion?'}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isAlreadyCompleted 
                    ? `Logged on ${exam.completedDate || exam.examDate}. Update marks or performance notes below.`
                    : 'Log your test date, calculated marks, and outcome.'}
                </p>
              </div>
            </div>

            {isAlreadyCompleted && (
              <button
                type="button"
                onClick={handleReopen}
                className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                title="Revert back to scheduled in-progress state"
              >
                Reopen
              </button>
            )}
          </div>

          {/* Date & Calculated Marks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Date Completed / Attempted
              </label>
              <input
                type="text"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                placeholder="e.g., 23-Aug-2026 or 2026-08-23"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Scheduled Date: {exam.examDate}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                Marks / Score Obtained
              </label>
              <input
                type="text"
                value={scoreMarks}
                onChange={(e) => setScoreMarks(e.target.value)}
                placeholder="e.g., 84.5/100, 118/200, or 78%"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Official or calculated marks</span>
            </div>
          </div>

          {/* Outcome Status Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              Outcome / Assessment Stage
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'Attempted - Awaiting Result', label: 'Attempted • Awaiting Result' },
                { id: 'Answer Key Checked', label: 'Answer Key Checked' },
                { id: 'Qualified for Next Stage / Mains', label: 'Qualified for Next Stage / Mains' },
                { id: 'Selected / In Merit List', label: 'Selected / Final Merit List' },
                { id: 'Not Qualified / Attempt Complete', label: 'Not Qualified (Attempt Complete)' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setOutcome(opt.id as CompletionOutcomeType)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    outcome === opt.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {outcome === opt.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Stage Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
              Target Pipeline Stage
            </label>
            <select
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value as TimelineStageType)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Exam Completed">7. Exam Completed & Results (Standard)</option>
              <option value="Mains">4. Mains / Technical Phase (If Prelims cleared)</option>
              <option value="Interview">5. Interview / Tier-III (If Mains cleared)</option>
              <option value="Document Verification">6. Document Verification (If shortlisted)</option>
            </select>
          </div>

          {/* Stage Matrix Toggles */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block mb-1">Update Associated Matrix Flags:</span>
            
            <div
              onClick={() => setMarkAttempted(!markAttempted)}
              className="flex items-center gap-2 cursor-pointer text-xs text-slate-700"
            >
              {markAttempted ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-300" />
              )}
              <span className="font-semibold">Mark Exam Attempted in Stage Matrix (Yes)</span>
            </div>

            <div
              onClick={() => setMarkAnswerKey(!markAnswerKey)}
              className="flex items-center gap-2 cursor-pointer text-xs text-slate-700"
            >
              {markAnswerKey ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-300" />
              )}
              <span>Mark Official Answer Key Evaluated</span>
            </div>

            <div
              onClick={() => setMarkResultAnnounced(!markResultAnnounced)}
              className="flex items-center gap-2 cursor-pointer text-xs text-slate-700"
            >
              {markResultAnnounced ? (
                <CheckSquare className="w-4 h-4 text-purple-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-300" />
              )}
              <span>Mark Result Officially Announced</span>
            </div>
          </div>

          {/* Memory Questions & Self-Reflection Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Post-Exam Review & Memory-Based Questions
            </label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Record good attempts, memory-based questions, paper difficulty, areas to revise for future exams..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAlreadyCompleted ? 'Update Completion Details' : 'Confirm & Complete Exam'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
