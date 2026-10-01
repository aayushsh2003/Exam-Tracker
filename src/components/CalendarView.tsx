import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Tag, 
  ArrowRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { ExamItem, MilestoneAction } from '../types';
import { getPriorityBadgeColor } from '../utils/dateHelpers';

interface CalendarViewProps {
  exams: ExamItem[];
  milestones: MilestoneAction[];
  onSelectExam: (exam: ExamItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  exams,
  milestones,
  onSelectExam,
}) => {
  // Current view month (0-indexed: 9 = October 2026, when upcoming active exams start)
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // October 2026
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeDayDetail, setActiveDayDetail] = useState<{ dateStr: string; events: any[] } | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Dynamically generate scheduled calendar items from exams and milestones
  const calendarEvents = useMemo(() => {
    const list: Array<{
      date: string;
      title: string;
      type: string;
      priority: string;
      examId?: string;
      status: 'completed' | 'upcoming' | 'deadline' | 'active';
      link?: string;
      examItem?: ExamItem;
    }> = [];

    // From exams
    exams.forEach(exam => {
      const isCompleted = exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted;

      // Exam Date Iso
      if (exam.examDateIso) {
        list.push({
          date: exam.examDateIso,
          title: exam.examName,
          type: isCompleted ? 'Exam Completed' : `${exam.timelineStage} Exam`,
          priority: exam.priority,
          examId: exam.id,
          status: isCompleted ? 'completed' : 'upcoming',
          link: exam.sourceUrl,
          examItem: exam,
        });
      }

      // If examDate has day ranges like 10–11 Oct 2026, also add the second day
      if (exam.examDate.includes('10–11 Oct 2026')) {
        list.push({
          date: '2026-10-11',
          title: `${exam.examName} (Day 2)`,
          type: 'Prelims Exam',
          priority: exam.priority,
          examId: exam.id,
          status: 'upcoming',
          link: exam.sourceUrl,
          examItem: exam,
        });
      }

      if (exam.examDate.includes('28 & 30 Oct 2026')) {
        list.push({
          date: '2026-10-28',
          title: `${exam.examName} (Day 2)`,
          type: 'CBT-I Exam',
          priority: exam.priority,
          examId: exam.id,
          status: 'upcoming',
          link: exam.sourceUrl,
          examItem: exam,
        });
        list.push({
          date: '2026-10-30',
          title: `${exam.examName} (Day 3)`,
          type: 'CBT-I Exam',
          priority: exam.priority,
          examId: exam.id,
          status: 'upcoming',
          link: exam.sourceUrl,
          examItem: exam,
        });
      }

      if (exam.examDate.includes('12 & 13 Dec 2026')) {
        list.push({
          date: '2026-12-12',
          title: `${exam.examName} (Day 2)`,
          type: 'Prelims Exam',
          priority: exam.priority,
          examId: exam.id,
          status: 'upcoming',
          link: exam.sourceUrl,
          examItem: exam,
        });
        list.push({
          date: '2026-12-13',
          title: `${exam.examName} (Day 3)`,
          type: 'Prelims Exam',
          priority: exam.priority,
          examId: exam.id,
          status: 'upcoming',
          link: exam.sourceUrl,
          examItem: exam,
        });
      }
    });

    // From milestones with dateIso
    milestones.forEach(m => {
      if (m.dateIso && !list.some(e => e.date === m.dateIso && e.title.includes(m.examPost))) {
        list.push({
          date: m.dateIso,
          title: `${m.examPost} - ${m.milestone}`,
          type: m.milestone,
          priority: m.priority === 'HIGH' ? 'High' : 'Medium',
          status: m.completed ? 'completed' : 'upcoming',
          examId: m.relatedExamId,
        });
      }
    });

    return list;
  }, [exams, milestones]);

  // TBA exams for the watchlist drawer
  const tbaExams = exams.filter(e => e.examDate.includes('TBA') || e.categoryGroup === 'awaitingDate');

  // Month navigation
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Build calendar matrix
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Exam Milestones & Scheduling Calendar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirmed schedules, prelims, mains, and TBA examination watchlist for 2026–2027.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedMonth(9); setSelectedYear(2026); }}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 transition-colors cursor-pointer"
            >
              Oct 2026 (Exams Start)
            </button>
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-extrabold text-slate-900 min-w-[130px] text-center font-sans">
                {monthNames[selectedMonth]} {selectedYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar + TBA Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-24 bg-slate-50/40 rounded-xl border border-transparent" />;
              }

              const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = calendarEvents.filter(e => e.date === dateStr);
              const isToday = selectedYear === 2026 && selectedMonth === 9 && day === 1;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => dayEvents.length > 0 && setActiveDayDetail({ dateStr, events: dayEvents })}
                  className={`h-24 p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : dayEvents.length > 0
                      ? 'border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-xs cursor-pointer'
                      : 'border-slate-100 bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold font-mono ${isToday ? 'text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded-full' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[50px] scrollbar-none">
                    {dayEvents.map((ev, i) => (
                      <div
                        key={i}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate ${
                          ev.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : ev.type === 'Deadline'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600"></span>
                <span>Active / Confirmed Exam</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                <span>Result Awaited / Attempted</span>
              </span>
            </div>
            <span>Click any highlighted day for details</span>
          </div>
        </div>

        {/* TBA Watchlist Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Awaiting Date Watchlist</h3>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {tbaExams.length} Posts
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Applications submitted whose exact Tier-I / test schedule will be released via upcoming portal circulars.
            </p>

            <div className="mt-4 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {tbaExams.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => onSelectExam(exam)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer bg-slate-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{exam.examName}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      Date TBA
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{exam.postTitle}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{exam.organization}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">Fee: {exam.applicationFee}</span>
                    <span className="text-indigo-600 font-semibold hover:underline">View specs →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Popover Modal */}
      {activeDayDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900 font-mono">
                  {activeDayDetail.dateStr}
                </h3>
              </div>
              <button
                onClick={() => setActiveDayDetail(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5">
              {activeDayDetail.events.map((ev, i) => (
                <div key={i} className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-950">{ev.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                      {ev.type}
                    </span>
                  </div>
                  {ev.examItem && (
                    <div className="text-[11px] text-slate-600 mt-1">
                      <p>{ev.examItem.postTitle} • {ev.examItem.organization}</p>
                      <p className="font-mono text-slate-700 mt-0.5">Status: {ev.examItem.statusTag || ev.examItem.status}</p>
                    </div>
                  )}
                  {ev.examItem && (
                    <button
                      onClick={() => {
                        onSelectExam(ev.examItem!);
                        setActiveDayDetail(null);
                      }}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>Open Post Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
