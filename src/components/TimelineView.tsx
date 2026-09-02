import React, { useState } from 'react';
import { 
  GitCommit, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { ExamItem, TimelineStageType } from '../types';
import { getPriorityBadgeColor, getCategoryBadgeColor } from '../utils/dateHelpers';

interface TimelineViewProps {
  exams: ExamItem[];
  onSelectExam: (exam: ExamItem) => void;
  onOpenAiAdvisorForExam: (exam: ExamItem) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  exams,
  onSelectExam,
  onOpenAiAdvisorForExam,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const stages: { id: TimelineStageType; label: string; desc: string; color: string }[] = [
    { id: 'Application Submitted', label: '1. Application Submitted', desc: 'Form verified, fees paid, registration active', color: 'indigo' },
    { id: 'Admit Card', label: '2. Admit Card / City Intimation', desc: 'Hall ticket downloaded & exam venue confirmed', color: 'blue' },
    { id: 'Prelims', label: '3. Prelims / CBT Phase', desc: 'Screening or Tier-1 test phase', color: 'amber' },
    { id: 'Mains', label: '4. Mains / Technical Phase', desc: 'Domain CS or specialized descriptive examination', color: 'purple' },
    { id: 'Interview', label: '5. Interview / Tier-II/III', desc: 'Personality test or practical evaluation', color: 'pink' },
    { id: 'Document Verification', label: '6. Document Verification', desc: 'Certificates, degrees, and credential checking', color: 'teal' },
    { id: 'Exam Completed', label: '7. Exam Completed & Results', desc: 'Answer keys evaluated & merit lists tracked', color: 'emerald' },
  ];

  const filteredExams = exams.filter((e) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'COMPLETED') return e.status === 'Completed' || e.timelineStage === 'Exam Completed';
    if (activeFilter === 'MAINS') return e.timelineStage === 'Mains';
    if (activeFilter === 'PRELIMS') return e.timelineStage === 'Prelims';
    if (activeFilter === 'VERY_HIGH') return e.priority === 'Very High';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <GitCommit className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                2026 Exam Pipeline & Timeline Stage Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Structured progressive lifecycle: Application Form → Admit Card → Prelims/CBT → Mains → Result / Next Stage.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: `All (${exams.length})` },
              { id: 'VERY_HIGH', label: 'Very High Priority' },
              { id: 'MAINS', label: 'Mains Stage' },
              { id: 'PRELIMS', label: 'Prelims Stage' },
              { id: 'COMPLETED', label: 'Completed' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const stageExams = filteredExams.filter(e => e.timelineStage === stage.id);
          if (stageExams.length === 0 && activeFilter !== 'ALL') return null;

          return (
            <div
              key={stage.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Stage Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{stage.label}</h3>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                    {stageExams.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{stage.desc}</p>
              </div>

              {/* Stage Posts List */}
              <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                {stageExams.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    No applications currently sitting in this stage.
                  </div>
                ) : (
                  stageExams.map((exam) => {
                    const priBadge = getPriorityBadgeColor(exam.priority);
                    const catBadge = getCategoryBadgeColor(exam.category);
                    const isCompleted = exam.status === 'Completed';

                    return (
                      <div
                        key={exam.id}
                        onClick={() => onSelectExam(exam)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                          isCompleted
                            ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70'
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {exam.examName}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                            {exam.priority}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium mt-0.5">{exam.postTitle}</p>
                        <p className="text-[11px] text-slate-500">{exam.organization}</p>

                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-100 pt-2">
                          <span className="font-mono font-semibold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {exam.examDate}
                          </span>
                          <span className="text-slate-400 group-hover:text-indigo-600 font-semibold flex items-center gap-0.5">
                            Inspect <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
