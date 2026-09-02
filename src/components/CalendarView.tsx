import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { ExamItem, MilestoneAction } from '../types';
import { getDaysRemaining, getPriorityBadgeColor } from '../utils/dateHelpers';

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
  // Current view month (0-indexed: 8 = September 2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // September 2026
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeDayDetail, setActiveDayDetail] = useState<{ dateStr: string; events: any[] } | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate scheduled calendar items
  const calendarEvents = [
    { date: '2026-08-23', title: 'RSSB Basic Computer Instructor', type: 'Exam Completed', priority: 'High', examId: 'rssb-basic-comp-inst', status: 'completed' },
    { date: '2026-08-29', title: 'IBPS SPL-XVI IT Officer (Prelims)', type: 'Exam Attempted', priority: 'Very High', examId: 'ibps-spl-xvi', status: 'completed' },
    { date: '2026-09-01', title: 'CTET Sep 2026 Application Deadline (Extended)', type: 'Deadline', priority: 'Medium', examId: 'ctet-sep-2026', status: 'active' },
    { date: '2026-09-03', title: 'IndianOil Executive Application Deadline', type: 'Deadline', priority: 'Very High', examId: 'indianoil-exec-2026', status: 'active' },
    { date: '2026-09-16', title: 'ISRO Scientist/Engineer SC Application Deadline', type: 'Deadline', priority: 'Very High', examId: 'isro-icrb-2026', status: 'active' },
    { date: '2026-10-04', title: 'SBI PO 2026 Mains (Calendar date)', type: 'Mains Exam', priority: 'High', examId: 'sbi-po-2026', status: 'upcoming' },
    { date: '2026-10-10', title: 'IBPS Clerk XVI Prelims (Day 1)', type: 'Prelims Exam', priority: 'High', examId: 'ibps-clerk-xvi', status: 'upcoming' },
    { date: '2026-10-11', title: 'IBPS Clerk XVI Prelims (Day 2)', type: 'Prelims Exam', priority: 'High', examId: 'ibps-clerk-xvi', status: 'upcoming' },
    { date: '2026-11-01', title: 'IBPS SPL-XVI IT Officer Mains Exam', type: 'Mains Exam', priority: 'Very High', examId: 'ibps-spl-xvi', status: 'upcoming' },
    { date: '2026-12-27', title: 'IBPS Clerk XVI Mains Exam', type: 'Mains Exam', priority: 'Medium', examId: 'ibps-clerk-xvi', status: 'upcoming' },
  ];

  // TBA exams for the watchlist drawer
  const tbaExams = exams.filter(e => e.examDate.includes('TBA'));

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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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
                Confirmed exam dates, application deadlines, and pending notice watchlist for 2026.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedMonth(8); setSelectedYear(2026); }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Current (Sep 2026)
            </button>
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-extrabold text-slate-900 min-w-[130px] text-center font-sans">
                {monthNames[selectedMonth]} {selectedYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
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
              const isToday = selectedYear === 2026 && selectedMonth === 8 && day === 1;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => dayEvents.length > 0 && setActiveDayDetail({ dateStr, events: dayEvents })}
                  className={`h-24 p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : dayEvents.length > 0
                      ? 'border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-sm cursor-pointer'
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
                            ? 'bg-emerald-100 text-emerald-800'
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

          {/* Quick Legend */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Scheduled Exam / Phase
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Application Deadline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Completed Milestone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full ring-2 ring-indigo-500"></span>
              Today (01-Sep-2026)
            </span>
          </div>
        </div>

        {/* TBA Watchlist Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">TBA Dates Watchlist</h3>
                <p className="text-[11px] text-slate-500">Dates to be declared via official notice</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {tbaExams.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {tbaExams.map((item) => {
              const priBadge = getPriorityBadgeColor(item.priority);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectExam(item)}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.examName}
                    </h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 mt-0.5">{item.postTitle}</p>
                  <p className="text-[10px] text-slate-500">{item.organization}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded">
                    <span>Target: Watch official portal</span>
                    <span className="font-semibold group-hover:underline">Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Events Detail Modal / Banner */}
      {activeDayDetail && (
        <div className="p-4 rounded-2xl bg-indigo-900 text-white flex items-center justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-300" />
              <h4 className="font-bold text-sm">Events on {activeDayDetail.dateStr}</h4>
            </div>
            <ul className="mt-1.5 space-y-1 text-xs text-indigo-100">
              {activeDayDetail.events.map((e, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <strong className="text-white">{e.title}</strong> — {e.type} ({e.priority} Priority)
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setActiveDayDetail(null)}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
