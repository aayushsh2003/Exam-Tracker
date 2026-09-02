import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  HelpCircle, 
  Search, 
  Sparkles, 
  Edit3,
  Check,
  X,
  FolderLock,
  Award,
  CheckCircle
} from 'lucide-react';
import { ExamItem } from '../types';
import { getPriorityBadgeColor } from '../utils/dateHelpers';

interface StageTrackerViewProps {
  exams: ExamItem[];
  onUpdateExam: (updated: ExamItem) => void;
  onSelectExam: (exam: ExamItem) => void;
  onOpenCompleteModal?: (exam: ExamItem) => void;
}

export const StageTrackerView: React.FC<StageTrackerViewProps> = ({
  exams,
  onUpdateExam,
  onSelectExam,
  onOpenCompleteModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');

  const filtered = exams.filter(e => 
    !searchQuery ||
    e.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleStageFlag = (exam: ExamItem, key: keyof ExamItem['stageStatus']) => {
    const nextVal = !exam.stageStatus[key];
    let updated: ExamItem = {
      ...exam,
      stageStatus: {
        ...exam.stageStatus,
        [key]: nextVal,
      },
    };

    if (key === 'admitCardDownloaded') {
      updated.documentsReady = {
        ...updated.documentsReady,
        admitCard: nextVal,
      };
      if (nextVal && updated.timelineStage === 'Application Submitted') {
        updated.timelineStage = 'Admit Card';
      } else if (!nextVal && updated.timelineStage === 'Admit Card') {
        updated.timelineStage = 'Application Submitted';
      }
    } else if (key === 'examAttempted') {
      if (!nextVal && updated.isCompleted) {
        updated.isCompleted = false;
        updated.status = 'Applied';
        updated.timelineStage = 'Prelims';
      }
    }

    onUpdateExam(updated);
  };

  const handleChangeStage = (exam: ExamItem, stage: ExamItem['timelineStage']) => {
    let updated: ExamItem = { ...exam, timelineStage: stage };
    if (stage === 'Application Submitted') {
      updated.isCompleted = false;
      updated.status = 'Applied';
      updated.stageStatus.applicationConfirmed = true;
      updated.stageStatus.admitCardDownloaded = false;
      updated.stageStatus.examAttempted = false;
    } else if (stage === 'Admit Card') {
      updated.isCompleted = false;
      updated.status = 'Applied';
      updated.stageStatus.applicationConfirmed = true;
      updated.stageStatus.admitCardDownloaded = true;
      updated.stageStatus.examAttempted = false;
      updated.documentsReady.admitCard = true;
    } else if (stage === 'Exam Completed') {
      if (onOpenCompleteModal) {
        onOpenCompleteModal(exam);
        return;
      }
      updated.isCompleted = true;
      updated.status = 'Completed';
    }
    onUpdateExam(updated);
  };

  const toggleAllDocsReady = (exam: ExamItem) => {
    const allReady = Object.values(exam.documentsReady).every(Boolean);
    const updated: ExamItem = {
      ...exam,
      documentsReady: {
        applicationPdf: !allReady,
        feeReceipt: !allReady,
        idProof: !allReady,
        degreeCerts: !allReady,
        admitCard: !allReady,
      },
    };
    onUpdateExam(updated);
  };

  const handleSaveNotes = (exam: ExamItem) => {
    onUpdateExam({ ...exam, notes: notesDraft });
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Stage & Document Matrix Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live operational grid extracted from the "Tracker" sheet. Click any badge or status pill to toggle stage completions in real-time.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search post or stage notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider shadow-sm">
              <tr>
                <th className="py-3.5 px-3 min-w-[190px] border-b border-slate-800">Exam / Post Title</th>
                <th className="py-3.5 px-3 min-w-[140px] border-b border-slate-800">Lifecycle Stage</th>
                <th className="py-3.5 px-3 min-w-[95px] text-center border-b border-slate-800">App Confirmed</th>
                <th className="py-3.5 px-3 min-w-[105px] text-center border-b border-slate-800">Admit Card</th>
                <th className="py-3.5 px-3 min-w-[125px] border-b border-slate-800">Exam Date</th>
                <th className="py-3.5 px-3 min-w-[95px] text-center border-b border-slate-800">Attempted</th>
                <th className="py-3.5 px-3 min-w-[95px] text-center border-b border-slate-800">Answer Key</th>
                <th className="py-3.5 px-3 min-w-[95px] text-center border-b border-slate-800">Result Status</th>
                <th className="py-3.5 px-3 min-w-[95px] text-center border-b border-slate-800">Docs Ready</th>
                <th className="py-3.5 px-3 min-w-[120px] text-center border-b border-slate-800">Completion & Score</th>
                <th className="py-3.5 px-3 min-w-[85px] border-b border-slate-800">Priority</th>
                <th className="py-3.5 px-3 min-w-[220px] border-b border-slate-800">Notes & Verification Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-700">
              {filtered.map((exam, idx) => {
                const priBadge = getPriorityBadgeColor(exam.priority);
                const allDocs = Object.values(exam.documentsReady).every(Boolean);
                const isCompleted = exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted;

                return (
                  <tr
                    key={exam.id}
                    className={`hover:bg-indigo-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    } ${isCompleted ? 'bg-emerald-50/30' : ''}`}
                  >
                    {/* Exam / Post */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onSelectExam(exam)}
                        className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors flex items-center gap-1.5"
                      >
                        <span>{exam.examName}</span>
                        {isCompleted && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                        )}
                      </button>
                      <span className="text-[11px] text-slate-600 font-medium block truncate max-w-[220px]">
                        {exam.postTitle}
                      </span>
                      <span className="text-[10px] text-slate-400">{exam.organization}</span>
                    </td>

                    {/* Lifecycle Stage Selector */}
                    <td className="py-3 px-3">
                      <select
                        value={exam.timelineStage}
                        onChange={(e) => handleChangeStage(exam, e.target.value as any)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer w-full ${
                          exam.timelineStage === 'Application Submitted'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : exam.timelineStage === 'Admit Card'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : exam.timelineStage === 'Prelims'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : exam.timelineStage === 'Mains'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : exam.timelineStage === 'Exam Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <option value="Application Submitted">1. Application Submitted</option>
                        <option value="Admit Card">2. Admit Card Available</option>
                        <option value="Prelims">3. Prelims / CBT</option>
                        <option value="Mains">4. Mains Phase</option>
                        <option value="Interview">5. Interview</option>
                        <option value="Document Verification">6. Doc Verification</option>
                        <option value="Exam Completed">7. Exam Completed</option>
                      </select>
                    </td>

                    {/* App Confirmed */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleStageFlag(exam, 'applicationConfirmed')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                          exam.stageStatus.applicationConfirmed
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {exam.stageStatus.applicationConfirmed ? 'YES (Confirmed)' : 'NO'}
                      </button>
                    </td>

                    {/* Admit Card */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleStageFlag(exam, 'admitCardDownloaded')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                          exam.stageStatus.admitCardDownloaded
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {exam.stageStatus.admitCardDownloaded ? 'Downloaded' : 'Pending/Check'}
                      </button>
                    </td>

                    {/* Exam Date */}
                    <td className="py-3 px-3">
                      <span className={`font-mono text-xs font-semibold ${isCompleted ? 'text-emerald-800 font-bold' : 'text-indigo-950'}`}>
                        {exam.examDate}
                      </span>
                    </td>

                    {/* Attempted */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleStageFlag(exam, 'examAttempted')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                          exam.stageStatus.examAttempted
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {exam.stageStatus.examAttempted ? 'YES' : 'Pending'}
                      </button>
                    </td>

                    {/* Answer Key */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleStageFlag(exam, 'answerKeyChecked')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                          exam.stageStatus.answerKeyChecked
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {exam.stageStatus.answerKeyChecked ? 'Checked' : 'Pending'}
                      </button>
                    </td>

                    {/* Result */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleStageFlag(exam, 'resultAnnounced')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                          exam.stageStatus.resultAnnounced
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {exam.stageStatus.resultAnnounced ? 'Announced' : 'Pending'}
                      </button>
                    </td>

                    {/* Documents Ready */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleAllDocsReady(exam)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all flex items-center justify-center gap-1 mx-auto ${
                          allDocs
                            ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        <FolderLock className="w-3 h-3" />
                        <span>{allDocs ? 'YES / Ready' : 'Check'}</span>
                      </button>
                    </td>

                    {/* Completion & Score Modal Trigger */}
                    <td className="py-3 px-3 text-center">
                      {onOpenCompleteModal ? (
                        <button
                          onClick={() => onOpenCompleteModal(exam)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all flex items-center justify-center gap-1 mx-auto shadow-2xs ${
                            isCompleted
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          <span>{isCompleted ? (exam.scoreMarks ? `${exam.scoreMarks}` : 'Completed') : 'Complete'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500">
                          {isCompleted ? 'Done' : 'Pending'}
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                        {exam.priority}
                      </span>
                    </td>

                    {/* Notes (Editable Inline) */}
                    <td className="py-3 px-3">
                      {editingNotesId === exam.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-indigo-300 rounded bg-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveNotes(exam)}
                            className="p-1 rounded bg-indigo-600 text-white"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="p-1 rounded bg-slate-200 text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group/note">
                          <span className="text-[11px] text-slate-600 line-clamp-2">
                            {exam.notes || 'Keep application PDF + fee receipt + photo/ID'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingNotesId(exam.id);
                              setNotesDraft(exam.notes || '');
                            }}
                            className="opacity-0 group-hover/note:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-opacity"
                            title="Edit Notes"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
