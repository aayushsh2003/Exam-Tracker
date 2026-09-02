import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  FileCheck,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import { ExamItem } from '../types';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExam?: ExamItem | null;
  exams: ExamItem[];
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  selectedExam,
  exams,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseHtml, setResponseHtml] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      title: 'Overlap Timetable (Banking + CS)',
      prompt: 'Create a focused 60-day timetable balancing IBPS SPL-XVI IT Officer Mains (01-Nov-2026), SBI PO Mains (04-Oct-2026), and DSSSB CS exams.',
    },
    {
      title: 'High-Yield CS Core Topics',
      prompt: 'Provide a high-yield checklist for core Computer Science (DBMS, OS, Networks, TOC, Algorithms, Cyber Security) tailored for ISRO, CIL MT, BARC, and DSSSB.',
    },
    {
      title: 'Document Verification Checklist',
      prompt: 'What are the critical certificates, OBC/EWS validity dates, degree transcripts, and admit card stamps needed for central PSU and banking Document Verification (DV)?',
    },
    {
      title: 'SEBI IT Interview & Tech Strategy',
      prompt: 'What are the most frequent technical and regulatory topics asked in SEBI Grade A IT Officer and SEBI YPP technical assessments?',
    },
  ];

  const handleAskAdvisor = async (customPrompt?: string) => {
    const q = customPrompt || promptInput;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResponseHtml(null);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          examContext: selectedExam || {
            totalExams: exams.length,
            confirmedPosts: exams.map(e => `${e.examName} (${e.postTitle})`).join(', '),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch AI strategy.');
      }

      setResponseHtml(data.response);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong connecting to AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">AI Exam Strategist & Syllabus Mentor</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedExam
                  ? `Contextual strategy for ${selectedExam.examName} • ${selectedExam.postTitle}`
                  : 'Syllabus breakdowns, study schedules, and overlapping exam strategies'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Preset Quick Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Suggested Strategy Workflows
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => {
                    setPromptInput(qp.prompt);
                    handleAskAdvisor(qp.prompt);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 text-left transition-all text-xs group"
                >
                  <span className="font-bold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {qp.title}
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{qp.prompt}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Area */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-6">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Synthesizing Examination Strategy...</p>
                <p className="text-xs text-slate-500">Cross-referencing syllabus, difficulty matrix, and schedule clash resolution.</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Advisory Note:</strong> {errorMsg}
              </div>
            </div>
          )}

          {responseHtml && !loading && (
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-indigo-900 font-bold">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Strategic Advice Generated</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(responseHtml)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600"
                >
                  Copy Text
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {responseHtml}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Input Box */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAdvisor();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask anything (e.g. syllabus, mock test strategy, overlap planning)..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !promptInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
