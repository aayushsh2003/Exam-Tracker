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
  LayoutGrid, 
  Table as TableIcon, 
  CheckCircle, 
  Download, 
  Award, 
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { ExamItem, PriorityLevel, TimelineStageType } from '../types';
import { getPriorityBadgeColor, getCategoryBadgeColor } from '../utils/dateHelpers';
import { exportCategorizedJson } from '../utils/exportUtils';

interface MasterTrackerViewProps {
  exams: ExamItem[];
  onSelectExam: (exam: ExamItem) => void;
  onEditExam: (exam: ExamItem) => void;
  onDeleteExam: (id: string) => void;
  onAddNewExam: () => void;
  onOpenAiAdvisorForExam: (exam: ExamItem) => void;
  onExportCsv: () => void;
  onExportJson?: () => void;
  onOpenBackupModal?: () => void;
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
  onExportJson,
  onOpenBackupModal,
  onOpenCompleteModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'AWAITING_DATE' | 'AWAITED' | 'ANNOUNCED'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'priority' | 'org' | 'order'>('default');

  // Group counts
  const counts = useMemo(() => {
    let upcoming = 0;
    let awaitingDate = 0;
    let completedAwaited = 0;
    let completedAnnounced = 0;

    exams.forEach(e => {
      const isCompleted = e.status === 'Completed' || e.timelineStage === 'Exam Completed' || e.isCompleted;
      if (e.categoryGroup === 'completedAnnounced' || (e.statusTag && e.statusTag.includes('Not Qualified'))) {
        completedAnnounced++;
      } else if (e.categoryGroup === 'completedAwaited' || (e.statusTag && (e.statusTag.includes('awaited') || e.statusTag.includes('next stage')))) {
        completedAwaited++;
      } else if (e.categoryGroup === 'awaitingDate' || (e.statusTag && e.statusTag.includes('TBA')) || (!isCompleted && e.examDate.includes('TBA'))) {
        awaitingDate++;
      } else {
        upcoming++;
      }
    });

    return {
      total: exams.length,
      upcoming,
      awaitingDate,
      completedAwaited,
      completedAnnounced,
    };
  }, [exams]);

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
      const isAnnounced = exam.categoryGroup === 'completedAnnounced' || (exam.statusTag && exam.statusTag.includes('Not Qualified'));
      const isAwaited = exam.categoryGroup === 'completedAwaited' || (exam.statusTag && (exam.statusTag.includes('awaited') || exam.statusTag.includes('next stage')));
      const isAwaitingDate = exam.categoryGroup === 'awaitingDate' || (exam.statusTag && exam.statusTag.includes('TBA')) || (!exam.isCompleted && exam.examDate.includes('TBA'));
      const isUpcoming = !isAnnounced && !isAwaited && !isAwaitingDate;

      if (statusFilter === 'UPCOMING' && !isUpcoming) return false;
      if (statusFilter === 'AWAITING_DATE' && !isAwaitingDate) return false;
      if (statusFilter === 'AWAITED' && !isAwaited) return false;
      if (statusFilter === 'ANNOUNCED' && !isAnnounced) return false;

      const matchSearch =
        !searchQuery ||
        exam.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.minQualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.statusTag && exam.statusTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (exam.advertisementNo && exam.advertisementNo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || exam.category === selectedCategory;
      const matchPriority = selectedPriority === 'ALL' || exam.priority === selectedPriority;
      const matchStage = selectedStage === 'ALL' || exam.timelineStage === selectedStage;

      return matchSearch && matchCategory && matchPriority && matchStage;
    }).sort((a, b) => {
      if (sortBy === 'order') {
        return (a.displayOrder || 999) - (b.displayOrder || 999);
      }
      if (sortBy === 'name') return a.examName.localeCompare(b.examName);
      if (sortBy === 'org') return a.organization.localeCompare(b.organization);
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { 'Very High': 4, High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      // default: sort by upcoming order, then awaiting, then completed
      if (a.displayOrder && b.displayOrder) return a.displayOrder - b.displayOrder;
      if (a.displayOrder && !b.displayOrder) return -1;
      if (!a.displayOrder && b.displayOrder) return 1;
      return 0;
    });
  }, [exams, searchQuery, selectedCategory, selectedPriority, selectedStage, statusFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Header & Quick Category Pills */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Exam & Recruitment Master Tracker
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {filteredExams.length} of {exams.length} Posts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active schedule, previous exam records, application fees, results, and stage outcomes across all 31 tracked vacancies.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportCategorizedJson(exams)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download exact 4-category JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={onExportCsv}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Export as spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Sheet</span>
            </button>

            {onOpenBackupModal && (
              <button
                onClick={onOpenBackupModal}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Backup Hub</span>
              </button>
            )}

            <button
              onClick={onAddNewExam}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exam</span>
            </button>

            {/* Toggle Table/Cards */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid cards view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 CATEGORY STATUS FILTER BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Posts ({counts.total})
          </button>

          <button
            onClick={() => setStatusFilter('UPCOMING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'UPCOMING'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Upcoming Active ({counts.upcoming})</span>
          </button>

          <button
            onClick={() => setStatusFilter('AWAITING_DATE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'AWAITING_DATE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Awaiting Date ({counts.awaitingDate})</span>
          </button>

          <button
            onClick={() => setStatusFilter('AWAITED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'AWAITED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Completed — Result Awaited ({counts.completedAwaited})</span>
          </button>

          <button
            onClick={() => setStatusFilter('ANNOUNCED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ANNOUNCED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Completed — Result Announced ({counts.completedAnnounced})</span>
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exam, post, status tag, organization..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="default">Sort: Chronological / Sequence</option>
              <option value="order">Sort: Schedule Order (#1-#15)</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="name">Sort: Exam Name (A-Z)</option>
              <option value="org">Sort: Organization</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[720px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider shadow-xs">
                <tr>
                  <th className="py-3 px-3 min-w-[70px] border-b border-slate-800">Order/ID</th>
                  <th className="py-3 px-3 min-w-[190px] border-b border-slate-800">Exam / Recruitment</th>
                  <th className="py-3 px-3 min-w-[180px] border-b border-slate-800">Post / Domain</th>
                  <th className="py-3 px-3 min-w-[160px] border-b border-slate-800">Official Status Tag</th>
                  <th className="py-3 px-3 min-w-[130px] border-b border-slate-800">Exam / Prev Date</th>
                  <th className="py-3 px-3 min-w-[90px] border-b border-slate-800">Fee</th>
                  <th className="py-3 px-3 min-w-[120px] border-b border-slate-800">Stage</th>
                  <th className="py-3 px-3 min-w-[110px] border-b border-slate-800">Priority</th>
                  <th className="py-3 px-3 min-w-[110px] text-right border-b border-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-slate-700">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No exams match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam, idx) => {
                    const priBadge = getPriorityBadgeColor(exam.priority);
                    const isCompleted = exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted;
                    const isAnnouncedNotQual = exam.statusTag?.includes('Not Qualified');

                    return (
                      <tr
                        key={exam.id}
                        className={`hover:bg-indigo-50/40 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        } ${
                          isAnnouncedNotQual 
                            ? 'bg-rose-50/30 border-l-4 border-l-rose-400' 
                            : isCompleted 
                            ? 'bg-blue-50/25 border-l-4 border-l-blue-400' 
                            : ''
                        }`}
                      >
                        {/* Order or ID */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-500">
                          {exam.displayOrder ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px]">
                              #{exam.displayOrder}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">id:{exam.id}</span>
                          )}
                        </td>

                        {/* Exam Name */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => onSelectExam(exam)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{exam.examName}</span>
                            {exam.sourceUrl && (
                              <a
                                href={exam.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-indigo-600 p-0.5"
                                title="Open official portal"
                              >
                                <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            )}
                          </button>
                          <p className="text-[10px] text-slate-400 font-medium">{exam.organization}</p>
                        </td>

                        {/* Post Title */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">{exam.postTitle}</span>
                          <span className="text-[10px] text-slate-500 block">{exam.category}</span>
                        </td>

                        {/* Official Status Tag */}
                        <td className="py-3 px-3">
                          <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                            exam.statusTag?.includes('Not Qualified')
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : exam.statusTag?.includes('awaited') || exam.statusTag?.includes('next stage')
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : exam.statusTag?.includes('TBA')
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {exam.statusTag || exam.status}
                          </span>
                        </td>

                        {/* Exam Date / Previous Exam Date */}
                        <td className="py-3 px-3 font-mono text-xs">
                          <div className="font-bold text-slate-800">
                            {exam.examDate}
                          </div>
                          {exam.prevExamDate && exam.prevExamDate !== exam.examDate && (
                            <span className="text-[10px] text-slate-500 block">Prev: {exam.prevExamDate}</span>
                          )}
                        </td>

                        {/* Fee */}
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {exam.applicationFee}
                          </span>
                          <span className={`text-[10px] block font-semibold ${
                            exam.feeStatus === 'Exempted' ? 'text-blue-600' : 'text-emerald-600'
                          }`}>
                            {exam.feeStatus}
                          </span>
                        </td>

                        {/* Stage */}
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            exam.timelineStage === 'Exam Completed' || isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : exam.timelineStage === 'Mains'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : exam.timelineStage === 'Prelims'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {exam.timelineStage}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priBadge.dot}`}></span>
                            {exam.priority}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Complete Exam Trigger */}
                            {onOpenCompleteModal && (
                              <button
                                onClick={() => onOpenCompleteModal(exam)}
                                title={isCompleted ? "Update Completion Outcome & Scores" : "Mark Exam as Completed"}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
                              title="Ask AI Syllabus & Strategy"
                              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectExam(exam)}
                              title="View Full Post Specs"
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditExam(exam)}
                              title="Edit Record"
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteExam(exam.id)}
                              title="Delete Record"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
            const isCompleted = exam.status === 'Completed' || exam.timelineStage === 'Exam Completed' || exam.isCompleted;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {exam.displayOrder && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 mr-1.5">
                          #{exam.displayOrder}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                        {exam.priority}
                      </span>
                    </div>

                    {isCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completed
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 mt-2 hover:text-indigo-600 cursor-pointer" onClick={() => onSelectExam(exam)}>
                    {exam.examName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700">{exam.postTitle}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{exam.organization}</p>

                  {/* Status Tag Pill */}
                  <div className="mt-3">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                      exam.statusTag?.includes('Not Qualified')
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : exam.statusTag?.includes('awaited') || exam.statusTag?.includes('next stage')
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : exam.statusTag?.includes('TBA')
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {exam.statusTag || exam.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Exam Date:</span>
                      <span className="font-mono font-bold text-slate-800">{exam.examDate}</span>
                    </div>
                    {exam.prevExamDate && exam.prevExamDate !== exam.examDate && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Previous Exam:</span>
                        <span className="font-mono text-slate-600">{exam.prevExamDate}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fee:</span>
                      <span className="font-mono font-bold text-slate-800">{exam.applicationFee} ({exam.feeStatus})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pipeline Stage:</span>
                      <span className="font-semibold text-indigo-700">{exam.timelineStage}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {onOpenCompleteModal && (
                    <button
                      onClick={() => onOpenCompleteModal(exam)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Edit Completion' : 'Mark Completed'}</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    {exam.sourceUrl && (
                      <a
                        href={exam.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-indigo-600"
                        title="Official portal link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onSelectExam(exam)}
                      className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      title="View specs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditExam(exam)}
                      className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
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
