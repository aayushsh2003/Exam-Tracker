import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Filter,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MilestoneAction, PriorityLevel } from '../types';
import { getDaysRemaining, getPriorityBadgeColor } from '../utils/dateHelpers';

interface ActionTrackerViewProps {
  milestones: MilestoneAction[];
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (action: MilestoneAction) => void;
  onDeleteMilestone: (id: string) => void;
}

export const ActionTrackerView: React.FC<ActionTrackerViewProps> = ({
  milestones,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New action form state
  const [newDate, setNewDate] = useState('');
  const [newExamPost, setNewExamPost] = useState('');
  const [newMilestone, setNewMilestone] = useState('');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newAction, setNewAction] = useState('');

  const completedCount = milestones.filter(m => m.completed).length;
  const totalCount = milestones.length;
  const completionPct = Math.round((completedCount / (totalCount || 1)) * 100);

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      // Trigger festive celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    onToggleMilestone(id);
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamPost.trim() || !newAction.trim()) return;

    const actionItem: MilestoneAction = {
      id: `action-${Date.now()}`,
      date: newDate.trim() || 'TBA',
      dateIso: newDate.trim() ? newDate : undefined,
      examPost: newExamPost.trim(),
      milestone: newMilestone.trim() || 'Custom Milestone',
      priority: newPriority,
      action: newAction.trim(),
      completed: false,
    };

    onAddMilestone(actionItem);
    setShowAddForm(false);
    setNewDate('');
    setNewExamPost('');
    setNewMilestone('');
    setNewAction('');
  };

  const filteredMilestones = milestones.filter((m) => {
    const matchSearch =
      !searchQuery ||
      m.examPost.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.milestone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.date.toLowerCase().includes(searchQuery.toLowerCase());

    const matchPriority = filterPriority === 'ALL' || m.priority === filterPriority;
    const matchStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && !m.completed) ||
      (filterStatus === 'COMPLETED' && m.completed);

    return matchSearch && matchPriority && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Action Hub Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <CheckSquare className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Action Plan & Milestones Execution Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct task checklist extracted from the "Action" workbook sheet. Mark tasks as completed to track operational readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800">{completedCount} of {totalCount} Done</span>
              <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
              </div>
            </div>

            <button
              id="btn-add-action"
              onClick={() => setShowAddForm(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Action</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, exams, milestones..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority Only</option>
              <option value="MEDIUM">Medium Priority Only</option>
              <option value="LOW">Low Priority Only</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Statuses ({totalCount})</option>
              <option value="PENDING">Pending Tasks ({totalCount - completedCount})</option>
              <option value="COMPLETED">Completed Tasks ({completedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Action Modal Form */}
      {showAddForm && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-indigo-950">Add Custom Action Item / Milestone</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateAction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Date / TBA</label>
              <input
                type="text"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="e.g. 15-Oct-2026 or TBA"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Exam / Post *</label>
              <input
                type="text"
                required
                value={newExamPost}
                onChange={(e) => setNewExamPost(e.target.value)}
                placeholder="e.g. ISRO ICRB Scientist SC"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Milestone Name</label>
              <input
                type="text"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="e.g. Admit Card Download"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Action Required *</label>
              <input
                type="text"
                required
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="e.g. Solve 5 full mock exams; preserve application PDF print..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Save Action
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Table / Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-3 min-w-[120px]">Target Date</th>
                <th className="py-3 px-3 min-w-[190px]">Exam / Post</th>
                <th className="py-3 px-3 min-w-[170px]">Milestone</th>
                <th className="py-3 px-3 min-w-[90px]">Priority</th>
                <th className="py-3 px-4 min-w-[340px]">Action Required</th>
                <th className="py-3 px-3 w-16 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMilestones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No actions match current filters.
                  </td>
                </tr>
              ) : (
                filteredMilestones.map((item, idx) => {
                  const countdown = getDaysRemaining(item.dateIso);
                  const priColor = item.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-indigo-50/40 transition-colors ${
                        item.completed ? 'bg-slate-50/70 opacity-60' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggle(item.id, item.completed)}
                          className="text-indigo-600 hover:scale-110 transition-transform"
                          title={item.completed ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {item.completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900">{item.date}</span>
                        {item.dateIso && !item.completed && (
                          <span className="block text-[10px] text-indigo-600 font-semibold mt-0.5">
                            {countdown.text}
                          </span>
                        )}
                      </td>

                      {/* Exam / Post */}
                      <td className="py-3 px-3">
                        <span className={`font-bold text-slate-900 ${item.completed ? 'line-through text-slate-400' : ''}`}>
                          {item.examPost}
                        </span>
                      </td>

                      {/* Milestone */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{item.milestone}</span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priColor}`}>
                          {item.priority}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4">
                        <p className={`text-xs text-slate-700 leading-relaxed ${item.completed ? 'line-through text-slate-400' : ''}`}>
                          {item.action}
                        </p>
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onDeleteMilestone(item.id)}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-600 transition-colors"
                          title="Delete Action"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
