import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Award, 
  Calendar, 
  FileText, 
  RotateCcw, 
  CheckSquare, 
  Square,
  BarChart2,
  TrendingUp,
  BookmarkCheck,
  ShieldCheck,
  Info
} from 'lucide-react';
import { ExamItem, CompletionOutcomeType, TimelineStageType, ExamCategoryGroup } from '../types';

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
    if (exam?.prevExamDate) return exam.prevExamDate;
    if (exam?.examDate && !exam.examDate.includes('TBA')) return exam.examDate.split('(')[0].trim();
    return new Date().toISOString().split('T')[0];
  });

  const [scoreMarks, setScoreMarks] = useState<string>(exam?.scoreMarks || '');
  const [outcome, setOutcome] = useState<CompletionOutcomeType>(
    (exam?.completionOutcome as CompletionOutcomeType) || 'Attempted - Awaiting Result'
  );
  const [targetStage, setTargetStage] = useState<TimelineStageType>(
    exam?.timelineStage || 'Exam Completed'
  );
  const [completionNotes, setCompletionNotes] = useState<string>(
    exam?.completionNotes || exam?.notes || ''
  );
  const [markAttempted, setMarkAttempted] = useState<boolean>(true);
  const [markAnswerKey, setMarkAnswerKey] = useState<boolean>(exam?.stageStatus?.answerKeyChecked || false);
  const [markResultAnnounced, setMarkResultAnnounced] = useState<boolean>(exam?.stageStatus?.resultAnnounced || false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (exam) {
      setCompletedDate(
        exam.completedDate ||
        exam.prevExamDate ||
        (exam.examDate && !exam.examDate.includes('TBA') ? exam.examDate.split('(')[0].trim() : new Date().toISOString().split('T')[0])
      );
      setScoreMarks(exam.scoreMarks || '');
      setOutcome((exam.completionOutcome as CompletionOutcomeType) || (exam.isCompleted ? 'Attempted - Awaiting Result' : 'Attempted - Awaiting Result'));
      setTargetStage(exam.timelineStage === 'Exam Completed' ? 'Exam Completed' : (exam.isCompleted ? 'Exam Completed' : 'Exam Completed'));
      setCompletionNotes(exam.completionNotes || exam.notes || '');
      setMarkAttempted(exam.stageStatus?.examAttempted ?? true);
      setMarkAnswerKey(exam.stageStatus?.answerKeyChecked || false);
      setMarkResultAnnounced(exam.stageStatus?.resultAnnounced || false);
      setShowRevertConfirm(false);
    }
  }, [exam]);

  if (!isOpen || !exam) return null;

  const handleSelectOutcome = (newOutcome: CompletionOutcomeType) => {
    setOutcome(newOutcome);
    if (newOutcome === 'Answer Key Checked') {
      setMarkAnswerKey(true);
    } else if (newOutcome === 'CBT Completed - Result / Next Stage') {
      setMarkAttempted(true);
      setTargetStage('Exam Completed');
    } else if (newOutcome === 'Qualified for Next Stage / Mains') {
      setMarkResultAnnounced(true);
      setMarkAnswerKey(true);
      setTargetStage('Mains');
    } else if (newOutcome === 'Selected / In Merit List') {
      setMarkResultAnnounced(true);
      setMarkAnswerKey(true);
      setTargetStage('Exam Completed');
    } else if (newOutcome === 'Not Qualified / Attempt Complete') {
      setMarkResultAnnounced(true);
      setTargetStage('Exam Completed');
    }
  };

  const triggerConfettiAnimation = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const handleSave = (markAsDone: boolean = true) => {
    if (markAsDone) {
      triggerConfettiAnimation();
    }

    // Determine categoryGroup and statusTag
    let catGroup: ExamCategoryGroup | undefined = exam.categoryGroup;
    let tag: string | undefined = exam.statusTag;

    if (markAsDone) {
      if (outcome === 'Not Qualified / Attempt Complete') {
        catGroup = 'completedAnnounced';
        tag = '❌ Exam completed — result announced (Not Qualified)';
      } else if (outcome === 'Attempted - Awaiting Result') {
        catGroup = 'completedAwaited';
        tag = '✅ Exam completed — result awaited';
      } else if (outcome === 'CBT Completed - Result / Next Stage') {
        catGroup = 'completedAwaited';
        tag = '✅ CBT completed — result/next stage';
      } else if (outcome === 'Qualified for Next Stage / Mains') {
        catGroup = 'upcomingActive';
        tag = '✅ Qualified for Mains';
      } else if (outcome === 'Selected / In Merit List') {
        catGroup = 'completedAnnounced';
        tag = '🏆 Selected / In Merit List';
      }
    } else {
      catGroup = exam.examDate.includes('TBA') ? 'awaitingDate' : 'upcomingActive';
      tag = exam.examDate.includes('TBA') ? '🟡 Applied — date TBA' : '✅ Confirmed';
    }

    const updated: ExamItem = {
      ...exam,
      isCompleted: markAsDone,
      status: markAsDone ? (targetStage === 'Mains' || targetStage === 'Interview' ? 'Shortlisted' : 'Completed') : 'Applied',
      timelineStage: markAsDone ? targetStage : 'Application Submitted',
      completedDate: markAsDone ? completedDate : undefined,
      prevExamDate: markAsDone ? completedDate : exam.prevExamDate,
      scoreMarks: markAsDone ? (scoreMarks || 'Attempted') : undefined,
      completionOutcome: markAsDone ? outcome : undefined,
      completionNotes: markAsDone ? completionNotes : undefined,
      statusTag: tag,
      categoryGroup: catGroup,
      stageStatus: {
        ...exam.stageStatus,
        applicationConfirmed: true,
        admitCardDownloaded: true,
        examAttempted: markAsDone ? markAttempted : false,
        answerKeyChecked: markAsDone ? markAnswerKey : false,
        resultAnnounced: markAsDone ? markResultAnnounced : false,
        nextStageQualified: markAsDone && (outcome === 'Qualified for Next Stage / Mains' || outcome === 'Selected / In Merit List'),
      },
      updatedAt: new Date().toISOString(),
    };

    const saveCallback = onSaveCompletion || onSave;
    if (saveCallback) {
      saveCallback(updated);
    }

    setTimeout(() => {
      onClose();
    }, markAsDone ? 300 : 0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Celebration Confetti Overlay */}
        {showConfetti && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-indigo-950/20">
            <div className="text-center p-6 bg-white/95 rounded-2xl shadow-2xl border border-emerald-300 animate-bounce">
              <span className="text-4xl">🎉 🎯 ✨</span>
              <p className="text-sm font-extrabold text-emerald-800 mt-2">Exam Successfully Completed!</p>
              <p className="text-xs text-slate-600">Stage, outcome status & scores recorded in Master Tracker.</p>
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
                {isAlreadyCompleted ? 'Update Exam Completion & Outcome' : 'Mark Exam as Completed'}
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
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isAlreadyCompleted 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${isAlreadyCompleted ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold">
                  {isAlreadyCompleted ? 'Status: Exam Completed & Logged' : 'Log Completed Examination'}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isAlreadyCompleted 
                    ? `Recorded for ${exam.completedDate || exam.prevExamDate || exam.examDate}. Update marks, outcome or review notes below.`
                    : 'Record your attempt date, marks scored, and stage outcome.'}
                </p>
              </div>
            </div>

            {isAlreadyCompleted && (
              <div className="shrink-0">
                {showRevertConfirm ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 p-1.5 rounded-xl border border-rose-200">
                    <span className="text-[10px] text-rose-800 font-bold">Revert?</span>
                    <button
                      type="button"
                      onClick={() => handleSave(false)}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRevertConfirm(false)}
                      className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowRevertConfirm(true)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 flex items-center gap-1"
                    title="Revert back to scheduled in-progress state"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reopen</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Date & Marks Grid */}
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
                placeholder="e.g., August 2026 or 2026-08-23"
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
                placeholder="e.g., 84.5/100, 118/200, Scorecard issued"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Official marks, percentile, or status</span>
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
                { 
                  id: 'Attempted - Awaiting Result', 
                  label: 'Attempted • Awaiting Result', 
                  desc: 'Exam taken, result pending',
                  icon: '⏳'
                },
                { 
                  id: 'CBT Completed - Result / Next Stage', 
                  label: 'CBT Done • Next Stage Awaited', 
                  desc: 'CBT cleared/attended, interview/DV call awaited',
                  icon: '✅'
                },
                { 
                  id: 'Answer Key Checked', 
                  label: 'Answer Key Checked', 
                  desc: 'Responses cross-verified with key',
                  icon: '📋'
                },
                { 
                  id: 'Qualified for Next Stage / Mains', 
                  label: 'Qualified for Next Stage / Mains', 
                  desc: 'Shortlisted for Mains or Skill test',
                  icon: '🎯'
                },
                { 
                  id: 'Selected / In Merit List', 
                  label: 'Selected / Final Merit List', 
                  desc: 'Final appointment / rank secured',
                  icon: '🏆'
                },
                { 
                  id: 'Not Qualified / Attempt Complete', 
                  label: 'Not Qualified (Attempt Complete)', 
                  desc: 'Result declared, archive vacancy',
                  icon: '❌'
                },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => handleSelectOutcome(opt.id as CompletionOutcomeType)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-start justify-between ${
                    outcome === opt.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="block font-bold flex items-center gap-1.5">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                    <span className={`text-[10px] block mt-0.5 ${outcome === opt.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {opt.desc}
                    </span>
                  </div>
                  {outcome === opt.id && <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5 ml-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Stage Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
              Target Pipeline Stage to Display
            </label>
            <select
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value as TimelineStageType)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="Exam Completed">7. Exam Completed & Results (Standard completion)</option>
              <option value="Mains">4. Mains / Technical Phase (If Prelims cleared & Mains scheduled)</option>
              <option value="Interview">5. Interview / Tier-III (If Mains cleared & Interview invited)</option>
              <option value="Document Verification">6. Document Verification (If shortlisted for DV)</option>
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Controls how this exam is indexed across the Master Tracker and Pipeline tabs.
            </span>
          </div>

          {/* Stage Matrix Toggles */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Stage Matrix Verification Flags:
            </span>
            
            <div
              onClick={() => setMarkAttempted(!markAttempted)}
              className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900"
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
              className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900"
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
              className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900"
            >
              {markResultAnnounced ? (
                <CheckSquare className="w-4 h-4 text-purple-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-300" />
              )}
              <span>Mark Result Officially Declared</span>
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
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
