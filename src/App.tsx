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
  DataBackupModal 
} from './components/DataBackupModal';
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
  exportAllDataToJson,
  exportCategorizedJson,
  exportExamsOnlyToJson, 
  parseAndValidateExamJson 
} from './utils/exportUtils';

export default function App() {
  // State management with localStorage synchronization (version v3 with 31 exams)
  const [exams, setExams] = useState<ExamItem[]>(() => {
    const saved = localStorage.getItem('exams_master_tracker_v3');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 25) {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_EXAMS;
  });

  const [milestones, setMilestones] = useState<MilestoneAction[]>(() => {
    const saved = localStorage.getItem('exams_milestones_v3');
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
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('exams_master_tracker_v3', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('exams_milestones_v3', JSON.stringify(milestones));
  }, [milestones]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
    showToast(`Backup JSON with ${exams.length} exams downloaded successfully`);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndValidateExamJson(content);
      if (res.success && res.exams) {
        setExams(res.exams);
        if (res.milestones && res.milestones.length > 0) {
          setMilestones(res.milestones);
        }
        showToast(`Successfully restored ${res.exams.length} exam posts from ${file.name}`);
      } else {
        showToast(res.error || 'Invalid JSON format in uploaded file');
      }
    };
    reader.onerror = () => {
      showToast('Error reading uploaded JSON file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDirectImportData = (newExams: ExamItem[], newMilestones?: MilestoneAction[]) => {
    setExams(newExams);
    if (newMilestones && newMilestones.length > 0) {
      setMilestones(newMilestones);
    }
  };

  const handleResetData = () => {
    setExams(INITIAL_EXAMS);
    setMilestones(INITIAL_MILESTONES);
    localStorage.removeItem('exams_master_tracker_v3');
    localStorage.removeItem('exams_milestones_v3');
    localStorage.removeItem('exams_master_tracker_v1');
    localStorage.removeItem('exams_milestones_v1');
    showToast('Default dataset restored (31 categorized exams)');
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
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
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
            onExportJson={handleExportJson}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
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
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onExportJson={handleExportJson}
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
        onSaveCompletion={(updated) => {
          handleUpdateExam(updated);
          showToast(`Exam outcome logged for ${updated.examName}`);
        }}
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

      {/* Data Backup & JSON Management Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        exams={exams}
        milestones={milestones}
        onImportData={handleDirectImportData}
        onResetData={handleResetData}
        onToast={showToast}
      />
    </div>
  );
}
