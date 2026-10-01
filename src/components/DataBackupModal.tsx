import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Database,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileCode2,
  HardDrive,
  Layers,
  Sparkles
} from 'lucide-react';
import { ExamItem, MilestoneAction } from '../types';
import { 
  exportAllDataToJson, 
  exportCategorizedJson,
  exportExamsOnlyToJson, 
  exportExamsToCsv, 
  parseAndValidateExamJson,
  buildCategorizedExamJson 
} from '../utils/exportUtils';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: ExamItem[];
  milestones: MilestoneAction[];
  onImportData: (exams: ExamItem[], milestones?: MilestoneAction[]) => void;
  onResetData: () => void;
  onToast: (msg: string) => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  exams,
  milestones,
  onImportData,
  onResetData,
  onToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<{
    fileName: string;
    examsCount: number;
    milestonesCount: number;
    parsedExams: ExamItem[];
    parsedMilestones?: MilestoneAction[];
    formatDetected?: 'categorized' | 'standard' | 'backup';
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const categorizedSummary = buildCategorizedExamJson(exams);

  const handleProcessFile = (file: File) => {
    setParseError(null);
    setPreviewInfo(null);

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setParseError('Please select a valid .json file format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = parseAndValidateExamJson(content);
      if (res.success && res.exams) {
        setPreviewInfo({
          fileName: file.name,
          examsCount: res.exams.length,
          milestonesCount: res.milestones?.length || 0,
          parsedExams: res.exams,
          parsedMilestones: res.milestones,
          formatDetected: res.formatDetected,
        });
      } else {
        setParseError(res.error || 'Failed to parse JSON file.');
      }
    };
    reader.onerror = () => {
      setParseError('Error reading uploaded file from disk.');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyImport = () => {
    if (!previewInfo) return;
    onImportData(previewInfo.parsedExams, previewInfo.parsedMilestones);
    onToast(`Successfully restored ${previewInfo.examsCount} exam posts from ${previewInfo.fileName}`);
    setPreviewInfo(null);
    onClose();
  };

  const handleDownloadCategorizedJson = () => {
    exportCategorizedJson(exams);
    onToast(`Downloaded Categorized JSON (${exams.length} exams in 4 groups)`);
  };

  const handleDownloadFullJson = () => {
    exportAllDataToJson(exams, milestones);
    onToast('Full JSON backup downloaded successfully');
  };

  const handleDownloadExamsJson = () => {
    exportExamsOnlyToJson(exams);
    onToast('Exams dataset JSON downloaded successfully');
  };

  const handleDownloadCsv = () => {
    exportExamsToCsv(exams);
    onToast('Excel / CSV spreadsheet downloaded successfully');
  };

  const handleConfirmReset = () => {
    onResetData();
    setShowResetConfirm(false);
    onToast('Reset to default 31 categorized 2026/2027 exams');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Data Backup & JSON Management</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    JSON & CSV
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Download structured JSON snapshots or upload/restore your exam tracker at any time.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50/50">
          
          {/* SECTION 1: DOWNLOAD DATA */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownToLine className="w-4 h-4 text-indigo-600" />
                Download Data in JSON Format
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {exams.length} Posts Total
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Download your exam records formatted cleanly as JSON files or spreadsheet:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: Categorized JSON */}
              <button
                onClick={handleDownloadCategorizedJson}
                className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition-all group flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950">
                    <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Download Categorized JSON</span>
                  </div>
                  <p className="text-[11px] text-purple-800/90 mt-1 leading-normal">
                    Organized into 4 groups: Completed Announced ({categorizedSummary.completedAnnounced.length}), Completed Awaited ({categorizedSummary.completedAwaited.length}), Upcoming Active ({categorizedSummary.upcomingActive.length}), and Awaiting Date ({categorizedSummary.awaitingDate.length}).
                  </p>
                </div>
                <Download className="w-4 h-4 text-purple-600 shrink-0 group-hover:translate-y-0.5 transition-transform mt-0.5" />
              </button>

              {/* Option 2: Full JSON Backup */}
              <button
                onClick={handleDownloadFullJson}
                className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-left transition-all group flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                    <FileJson className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Download Full Backup (JSON)</span>
                  </div>
                  <p className="text-[11px] text-indigo-700/80 mt-1 leading-normal">
                    Full dataset with all exams, custom stage checklists, scores, notes, and milestones.
                  </p>
                </div>
                <Download className="w-4 h-4 text-indigo-600 shrink-0 group-hover:translate-y-0.5 transition-transform mt-0.5" />
              </button>

              {/* Option 3: Clean Exams Array JSON */}
              <button
                onClick={handleDownloadExamsJson}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all group flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <FileCode2 className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Download Exams List (JSON)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Standard JSON array of all {exams.length} exam items.
                  </p>
                </div>
                <Download className="w-4 h-4 text-slate-500 shrink-0 group-hover:translate-y-0.5 transition-transform mt-0.5" />
              </button>

              {/* Option 4: CSV */}
              <button
                onClick={handleDownloadCsv}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left transition-all group flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Export Excel / CSV Sheet</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Spreadsheet view with all columns and statuses.
                  </p>
                </div>
                <Download className="w-4 h-4 text-emerald-600 shrink-0 group-hover:translate-y-0.5 transition-transform mt-0.5" />
              </button>
            </div>
          </div>

          {/* SECTION 2: UPLOAD / IMPORT JSON */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpFromLine className="w-4 h-4 text-indigo-600" />
                Upload / Import in JSON Format
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                .json accepted
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Upload any JSON file — accepts either the 4-group categorized JSON format or full backup JSON:
            </p>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Upload className="w-5 h-5" />
              </div>

              <p className="text-xs font-bold text-slate-800">
                Click to browse or drop your JSON file here
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports categorized JSON format ({`{ completedAnnounced, completedAwaited, upcomingActive, awaitingDate }`}) or standard tracker arrays.
              </p>
            </div>

            {/* Error Message */}
            {parseError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Upload Error: </span>
                  {parseError}
                </div>
              </div>
            )}

            {/* Success Preview & Confirmation */}
            {previewInfo && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        Valid JSON File Detected: <span className="font-mono">{previewInfo.fileName}</span>
                      </h4>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Format: <strong className="capitalize">{previewInfo.formatDetected === 'categorized' ? 'Categorized 4-Group JSON' : 'Standard Backup'}</strong> • Found <strong className="font-bold">{previewInfo.examsCount} exam posts</strong>
                        {previewInfo.milestonesCount > 0 && ` and ${previewInfo.milestonesCount} action milestones`}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200/80">
                  <button
                    type="button"
                    onClick={() => setPreviewInfo(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyImport}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply & Restore Tracker</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: RESTORE DEFAULT DATASET */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Reset to Default Dataset</p>
                <p className="text-[11px] text-slate-500">Restore the 31 categorized 2026/2027 competitive exam records.</p>
              </div>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-rose-700">Are you sure?</span>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
