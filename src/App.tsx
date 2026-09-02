import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  DashboardView 
} from './components/DashboardView';
import { 
  MasterTrackerView 
} from './components/MasterTrackerView';
import { 
  TimelineView 
} from './components/TimelineView';
import { 
  CalendarView 
} from './components/CalendarView';
import { 
  ActionTrackerView 
} from './components/ActionTrackerView';
import { 
  StageTrackerView 
} from './components/StageTrackerView';
import { 
  ImportantReferencesView 
} from './components/ImportantReferencesView';
import { 
  AIAdvisorModal 
} from './components/AIAdvisorModal';
import { 
  ExamModal 
} from './components/ExamModal';
import { 
  ExamDetailDrawer 
} from './components/ExamDetailDrawer';
import {
  CompleteExamModal
} from './components/CompleteExamModal';
import { 
  INITIAL_EXAMS, 
  INITIAL_MILESTONES, 
  INITIAL_REFERENCES 
} from './data/initialData';
import { 
  ExamItem, 
  MilestoneAction, 
  ImportantReference, 
  ActiveTab 
} from './types';
import { 
  exportExamsToCsv, 
  exportAllDataToJson 
} from './utils/exportUtils';

export default function App() {
  // State management with localStorage synchronization
  const [exams, setExams] = useState<ExamItem[]>(() => {
    const saved = localStorage.getItem('exams_master_tracker_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_EXAMS;
  });

  const [milestones, setMilestones] = useState<MilestoneAction[]>(() => {
    const saved = localStorage.getItem('exams_milestones_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_MILESTONES;
  });

  const [references] = useState<ImportantReference[]>(INITIAL_REFERENCES);

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals & Drawers state
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<ExamItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiExamContext, setAiExamContext] = useState<ExamItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [examToComplete, setExamToComplete] = useState<ExamItem | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('exams_master_tracker_v1', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('exams_milestones_v1', JSON.stringify(milestones));
  }, [milestones]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Exam item CRUD operations
  const handleSaveExam = (exam: ExamItem) => {
    setExams((prev) => {
      const exists = prev.some((e) => e.id === exam.id);
      if (exists) {
        return prev.map((e) => (e.id === exam.id ? exam : e));
      } else {
        return [exam, ...prev];
      }
    });

    if (selectedExam && selectedExam.id === exam.id) {
      setSelectedExam(exam);
    }
    showToast(`Saved details for ${exam.examName}`);
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    if (selectedExam?.id === id) {
      setSelectedExam(null);
    }
    showToast('Exam removed from tracker');
  };

  const handleUpdateExam = (updated: ExamItem) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (selectedExam && selectedExam.id === updated.id) {
      setSelectedExam(updated);
    }
  };

  // Action milestone operations
  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAddMilestone = (newMilestone: MilestoneAction) => {
    setMilestones((prev) => [newMilestone, ...prev]);
    showToast('New action milestone created');
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    showToast('Milestone removed');
  };

  // Backup & Export Handlers
  const handleExportCsv = () => {
    exportExamsToCsv(exams);
    showToast('Excel CSV exported successfully');
  };

  const handleExportJson = () => {
    exportAllDataToJson(exams, milestones);
    showToast('Backup JSON exported');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.exams && Array.isArray(parsed.exams)) {
          setExams(parsed.exams);
        }
        if (parsed.milestones && Array.isArray(parsed.milestones)) {
          setMilestones(parsed.milestones);
        }
        showToast('Backup restored successfully');
      } catch (err) {
        alert('Invalid JSON backup file format');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Reset entire tracker back to default 20 confirmed 2026 exams data?')) {
      setExams(INITIAL_EXAMS);
      setMilestones(INITIAL_MILESTONES);
      localStorage.removeItem('exams_master_tracker_v1');
      localStorage.removeItem('exams_milestones_v1');
      showToast('Default 2026 dataset restored');
    }
  };

  const handleOpenAiForExam = (exam: ExamItem) => {
    setAiExamContext(exam);
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'aiAdvisor') {
            setAiExamContext(null);
            setIsAiModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        exams={exams}
        onAddNewExam={() => {
          setExamToEdit(null);
          setIsExamModalOpen(true);
        }}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetData={handleResetData}
        onOpenAiAdvisor={() => {
          setAiExamContext(null);
          setIsAiModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            exams={exams}
            milestones={milestones}
            onSelectExam={setSelectedExam}
            setActiveTab={setActiveTab}
            onOpenAiAdvisorForExam={handleOpenAiForExam}
            onOpenCompleteModal={(exam) => {
              setExamToComplete(exam);
              setIsCompleteModalOpen(true);
            }}
          />
        )}

        {activeTab === 'master' && (
          <MasterTrackerView
            exams={exams}
            onSelectExam={setSelectedExam}
            onEditExam={(exam) => {
              setExamToEdit(exam);
              setIsExamModalOpen(true);
            }}
            onDeleteExam={handleDeleteExam}
            onAddNewExam={() => {
              setExamToEdit(null);
              setIsExamModalOpen(true);
            }}
            onOpenAiAdvisorForExam={handleOpenAiForExam}
            onExportCsv={handleExportCsv}
            onOpenCompleteModal={(exam) => {
              setExamToComplete(exam);
              setIsCompleteModalOpen(true);
            }}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            exams={exams}
            onSelectExam={setSelectedExam}
            onOpenAiAdvisorForExam={handleOpenAiForExam}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            exams={exams}
            milestones={milestones}
            onSelectExam={setSelectedExam}
          />
        )}

        {activeTab === 'actions' && (
          <ActionTrackerView
            milestones={milestones}
            onToggleMilestone={handleToggleMilestone}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        )}

        {activeTab === 'stageTracker' && (
          <StageTrackerView
            exams={exams}
            onUpdateExam={handleUpdateExam}
            onSelectExam={setSelectedExam}
            onOpenCompleteModal={(exam) => {
              setExamToComplete(exam);
              setIsCompleteModalOpen(true);
            }}
          />
        )}

        {activeTab === 'references' && (
          <ImportantReferencesView
            references={references}
            exams={exams}
            onSelectExam={setSelectedExam}
            onOpenAiAdvisor={() => {
              setAiExamContext(null);
              setIsAiModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-medium">2026 Applied Exams Master Hub</span>
            <span className="text-slate-500">| Complete 20-Post Intelligence Portal</span>
          </div>
          <p className="text-slate-500 font-mono">
            Reference Anchor: 01-Sep-2026 • Local Offline Storage Active
          </p>
        </div>
      </footer>

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs font-semibold animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      {/* Detail Drawer */}
      <ExamDetailDrawer
        exam={selectedExam}
        onClose={() => setSelectedExam(null)}
        onEdit={(exam) => {
          setExamToEdit(exam);
          setIsExamModalOpen(true);
        }}
        onDelete={handleDeleteExam}
        onOpenAiAdvisor={handleOpenAiForExam}
        onUpdateExam={handleUpdateExam}
        onOpenCompleteModal={(exam) => {
          setExamToComplete(exam);
          setIsCompleteModalOpen(true);
        }}
      />

      {/* Complete Exam Modal */}
      <CompleteExamModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setExamToComplete(null);
        }}
        exam={examToComplete}
        onSave={(updated) => {
          handleUpdateExam(updated);
          showToast(`Exam outcome logged for ${updated.examName}`);
        }}
      />

      {/* Add / Edit Exam Modal */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setExamToEdit(null);
        }}
        onSave={handleSaveExam}
        examToEdit={examToEdit}
      />

      {/* AI Strategist Modal */}
      <AIAdvisorModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiExamContext(null);
        }}
        selectedExam={aiExamContext}
        exams={exams}
      />
    </div>
  );
}
