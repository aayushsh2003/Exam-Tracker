import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Eye, 
  Layers, 
  LayoutGrid, 
  Table as TableIcon, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowUpDown,
  Download,
  Award,
  CheckCircle2
} from 'lucide-react';
import { ExamItem, PriorityLevel, TimelineStageType } from '../types';
import { getPriorityBadgeColor, getCategoryBadgeColor } from '../utils/dateHelpers';

interface MasterTrackerViewProps {
  exams: ExamItem[];
  onSelectExam: (exam: ExamItem) => void;
  onEditExam: (exam: ExamItem) => void;
  onDeleteExam: (id: string) => void;
  onAddNewExam: () => void;
  onOpenAiAdvisorForExam: (exam: ExamItem) => void;
  onExportCsv: () => void;
  onOpenCompleteModal?: (exam: ExamItem) => void;
}

export const MasterTrackerView: React.FC<MasterTrackerViewProps> = ({
  exams,
  onSelectExam,
  onEditExam,
  onDeleteExam,
  onAddNewExam,
  onOpenAiAdvisorForExam,
  onExportCsv,
  onOpenCompleteModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'priority' | 'org'>('default');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    exams.forEach(e => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [exams]);

  // Filter and sort exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const isCompleted = exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted;
      
      if (statusFilter === 'ACTIVE' && isCompleted) return false;
      if (statusFilter === 'COMPLETED' && !isCompleted) return false;

      const matchSearch =
        !searchQuery ||
        exam.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.minQualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.advertisementNo && exam.advertisementNo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || exam.category === selectedCategory;
      const matchPriority = selectedPriority === 'ALL' || exam.priority === selectedPriority;
      const matchStage = selectedStage === 'ALL' || exam.timelineStage === selectedStage;

      return matchSearch && matchCategory && matchPriority && matchStage;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.examName.localeCompare(b.examName);
      if (sortBy === 'org') return a.organization.localeCompare(b.organization);
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { 'Very High': 4, High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });
  }, [exams, searchQuery, selectedCategory, selectedPriority, selectedStage, statusFilter, sortBy]);

  const completedCount = useMemo(() => {
    return exams.filter(e => e.status === 'Completed' || e.timelineStage === 'Exam Completed' || e.isCompleted).length;
  }, [exams]);

  return (
    <div className="space-y-4">
      {/* Header & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                2026 Exam & Recruitment Master Tracker
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {filteredExams.length} of {exams.length} Posts
              </span>
              {completedCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {completedCount} Completed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Master database tracking fee receipts, admit cards, exam dates, results, and stage completions across all 20 confirmed applications.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Quick Filter (All / Active / Completed) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({exams.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Active ({exams.length - completedCount})
              </button>
              <button
                onClick={() => setStatusFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  statusFilter === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Done ({completedCount})
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                id="btn-view-mode-table"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Excel Spreadsheet Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                id="btn-view-mode-cards"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* CSV Export */}
            <button
              id="btn-export-master-csv"
              onClick={onExportCsv}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Add New Exam */}
            <button
              id="btn-add-exam-master"
              onClick={onAddNewExam}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exam</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-master-tracker"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Exam, Post, Org, Post Code (41/26, 39/26), Advt..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              id="filter-priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="Very High">Very High Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              id="filter-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="default">Sort: Default Order</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="name">Sort: Exam Name (A-Z)</option>
              <option value="org">Sort: Organization</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider shadow-sm">
                <tr>
                  <th className="py-3 px-3 min-w-[170px] border-b border-slate-800">Exam / Recruitment</th>
                  <th className="py-3 px-3 min-w-[190px] border-b border-slate-800">Post / Domain</th>
                  <th className="py-3 px-3 min-w-[110px] border-b border-slate-800">Organization</th>
                  <th className="py-3 px-3 min-w-[110px] border-b border-slate-800">Priority</th>
                  <th className="py-3 px-3 min-w-[130px] border-b border-slate-800">Category</th>
                  <th className="py-3 px-3 min-w-[140px] border-b border-slate-800">Exam Date</th>
                  <th className="py-3 px-3 min-w-[140px] border-b border-slate-800">Admit Card</th>
                  <th className="py-3 px-3 min-w-[140px] border-b border-slate-800">Result / Next Stage</th>
                  <th className="py-3 px-3 min-w-[120px] border-b border-slate-800">Fee Status</th>
                  <th className="py-3 px-3 min-w-[130px] border-b border-slate-800">Timeline Stage</th>
                  <th className="py-3 px-3 min-w-[130px] text-right border-b border-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-slate-700">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      No exams match your search criteria. Try clearing filters.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam, idx) => {
                    const priBadge = getPriorityBadgeColor(exam.priority);
                    const catBadge = getCategoryBadgeColor(exam.category);
                    const isCompleted = exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted;

                    return (
                      <tr
                        key={exam.id}
                        className={`hover:bg-indigo-50/40 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        } ${isCompleted ? 'bg-emerald-50/35 border-l-4 border-l-emerald-500' : ''}`}
                      >
                        {/* Exam Name */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => onSelectExam(exam)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors flex items-center gap-1.5"
                          >
                            <span>{exam.examName}</span>
                            {isCompleted && (
                              <span title="Exam Completed & Logged">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                              </span>
                            )}
                          </button>
                          {exam.advertisementNo && (
                            <p className="text-[10px] text-slate-400 font-mono">{exam.advertisementNo}</p>
                          )}
                          {isCompleted && exam.scoreMarks && (
                            <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Score: {exam.scoreMarks}
                            </span>
                          )}
                        </td>

                        {/* Post Title */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">{exam.postTitle}</span>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{exam.minQualification}</p>
                        </td>

                        {/* Organization */}
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {exam.organization}
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priBadge.dot}`}></span>
                            {exam.priority}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
                            {exam.category}
                          </span>
                        </td>

                        {/* Exam Date */}
                        <td className="py-3 px-3">
                          <span className={`font-mono text-xs font-semibold ${
                            isCompleted || exam.examDate.includes('COMPLETED') || exam.examDate.includes('23-Aug')
                              ? 'text-emerald-700 font-bold'
                              : exam.examDate.includes('TBA')
                              ? 'text-amber-700'
                              : 'text-indigo-900'
                          }`}>
                            {exam.examDate}
                          </span>
                          {exam.completedDate && (
                            <p className="text-[10px] text-emerald-600 font-medium">Done: {exam.completedDate}</p>
                          )}
                        </td>

                        {/* Admit Card */}
                        <td className="py-3 px-3 text-slate-600">
                          {exam.admitCard}
                        </td>

                        {/* Result / Next Stage */}
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {exam.completionOutcome || exam.result}
                        </td>

                        {/* Fee Status */}
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            exam.feeStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : exam.feeStatus === 'Exempted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {exam.feeStatus}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{exam.applicationFee}</p>
                        </td>

                        {/* Timeline Stage */}
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            exam.timelineStage === 'Application Submitted'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : exam.timelineStage === 'Admit Card'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : exam.timelineStage === 'Prelims'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : exam.timelineStage === 'Mains'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : exam.timelineStage === 'Exam Completed' || isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {exam.timelineStage}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Complete Exam Trigger */}
                            {onOpenCompleteModal && (
                              <button
                                onClick={() => onOpenCompleteModal(exam)}
                                title={isCompleted ? "Edit Completion / Marks" : "Mark Exam as Completed"}
                                className={`p-1 rounded-lg transition-colors ${
                                  isCompleted 
                                    ? 'text-emerald-700 hover:bg-emerald-100 bg-emerald-50' 
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => onOpenAiAdvisorForExam(exam)}
                              title="Ask AI Strategist for syllabus & prep schedule"
                              className="p-1 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectExam(exam)}
                              title="View Full Post Specs"
                              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditExam(exam)}
                              title="Edit Details"
                              className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteExam(exam.id)}
                              title="Delete Record"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => {
            const priBadge = getPriorityBadgeColor(exam.priority);
            const catBadge = getCategoryBadgeColor(exam.category);
            const isCompleted = exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted;

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        onClick={() => onSelectExam(exam)}
                        className="font-extrabold text-base text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {exam.examName}
                        {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{exam.postTitle}</p>
                      <p className="text-xs text-slate-500">{exam.organization}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                      {exam.priority}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
                      {exam.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {exam.examDate}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {exam.scoreMarks ? `Score: ${exam.scoreMarks}` : 'Completed'}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div><strong className="text-slate-700">Selection:</strong> {exam.selectionProcess}</div>
                    <div><strong className="text-slate-700">Admit Card:</strong> {exam.admitCard}</div>
                    <div><strong className="text-slate-700">Result:</strong> {exam.completionOutcome || exam.result}</div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5">Key Preparation Focus:</span>
                    <p className="line-clamp-2 italic">{exam.keyPrep}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    exam.timelineStage === 'Application Submitted'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : exam.timelineStage === 'Admit Card'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : exam.timelineStage === 'Prelims'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : exam.timelineStage === 'Mains'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : exam.timelineStage === 'Exam Completed' || isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    Stage: {exam.timelineStage}
                  </span>
                  <div className="flex items-center gap-1">
                    {onOpenCompleteModal && (
                      <button
                        onClick={() => onOpenCompleteModal(exam)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title={isCompleted ? "Edit Score" : "Mark as Completed"}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Score' : 'Complete'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenAiAdvisorForExam(exam)}
                      className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">AI Advice</span>
                    </button>
                    <button
                      onClick={() => onSelectExam(exam)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold"
                    >
                      View Specs
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
