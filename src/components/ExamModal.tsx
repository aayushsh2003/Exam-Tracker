import React, { useState, useEffect } from 'react';
import { X, Save, Plus, FileText, CheckCircle } from 'lucide-react';
import { ExamItem, PriorityLevel, TimelineStageType } from '../types';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: ExamItem) => void;
  examToEdit?: ExamItem | null;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  examToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<ExamItem>>({
    examName: '',
    postTitle: '',
    organization: '',
    minQualification: '',
    selectionProcess: '',
    applicationFee: '₹100',
    feeStatus: 'Paid',
    status: 'Application Confirmed',
    category: 'PSU / IT / CS',
    advertisementNo: '',
    advertisementDate: '',
    applicationStart: '',
    applicationDeadline: '',
    examDate: 'TBA',
    admitCard: 'Pending Release',
    result: 'Pending',
    timelineStage: 'Application Submitted',
    priority: 'High',
    keyPrep: '',
    documentsRequired: 'Application PDF + Fee Receipt + Degree Certs + ID Proof',
    officialSource: '',
    notes: '',
  });

  useEffect(() => {
    if (examToEdit) {
      setFormData(examToEdit);
    } else {
      setFormData({
        examName: '',
        postTitle: '',
        organization: '',
        minQualification: 'B.E./B.Tech (CS/IT) / MCA / MSc (CS)',
        selectionProcess: 'CBT + Interview',
        applicationFee: '₹100 / Exempted',
        feeStatus: 'Paid',
        status: 'Application Confirmed',
        category: 'PSU / IT / CS',
        advertisementNo: '',
        advertisementDate: '2026',
        applicationStart: '2026',
        applicationDeadline: '2026',
        examDate: 'TBA (Watch Official Portal)',
        admitCard: 'To be released 7-10 days before exam',
        result: 'To be notified after examination',
        timelineStage: 'Application Submitted',
        priority: 'High',
        keyPrep: 'Technical Domain (CS) + Aptitude + General Awareness',
        documentsRequired: 'Application form printout, Fee receipt, 10th/12th/Degree marksheets, ID proof',
        officialSource: 'Official Recruitment Portal',
        notes: '',
      });
    }
  }, [examToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.examName || !formData.postTitle) return;

    const finalItem: ExamItem = {
      id: examToEdit?.id || `exam-${Date.now()}`,
      examName: formData.examName || '',
      postTitle: formData.postTitle || '',
      organization: formData.organization || '',
      minQualification: formData.minQualification || '',
      selectionProcess: formData.selectionProcess || '',
      applicationFee: formData.applicationFee || '',
      feeStatus: (formData.feeStatus as any) || 'Paid',
      status: formData.status || 'Application Confirmed',
      category: formData.category || 'PSU / IT / CS',
      advertisementNo: formData.advertisementNo,
      advertisementDate: formData.advertisementDate || '',
      applicationStart: formData.applicationStart || '',
      applicationDeadline: formData.applicationDeadline || '',
      examDate: formData.examDate || 'TBA',
      admitCard: formData.admitCard || '',
      result: formData.result || '',
      timelineStage: (formData.timelineStage as TimelineStageType) || 'Application Submitted',
      priority: (formData.priority as PriorityLevel) || 'High',
      keyPrep: formData.keyPrep || '',
      documentsRequired: formData.documentsRequired || '',
      officialSource: formData.officialSource || '',
      notes: formData.notes || '',
      documentsReady: examToEdit?.documentsReady || {
        applicationPdf: true,
        feeReceipt: true,
        idProof: true,
        degreeCerts: true,
        admitCard: false,
      },
      stageStatus: examToEdit?.stageStatus || {
        applicationConfirmed: true,
        admitCardDownloaded: false,
        examAttempted: false,
        answerKeyChecked: false,
        resultAnnounced: false,
        nextStageQualified: false,
      },
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base">
              {examToEdit ? 'Edit Exam Details' : 'Add New Applied Exam / Post'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Exam Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Exam / Recruitment Name *</label>
              <input
                type="text"
                required
                value={formData.examName || ''}
                onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                placeholder="e.g. ISRO ICRB 2026"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Post Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Post / Domain Title *</label>
              <input
                type="text"
                required
                value={formData.postTitle || ''}
                onChange={(e) => setFormData({ ...formData, postTitle: e.target.value })}
                placeholder="e.g. Scientist/Engineer 'SC' (Computer Science)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Organization / Board</label>
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. ISRO / DOS"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category / Sector</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. PSU / IT / CS, Banking, Research"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Priority Level</label>
              <select
                value={formData.priority || 'High'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Very High">Very High Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Timeline Stage */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Current Timeline Stage</label>
              <select
                value={formData.timelineStage || 'Application Submitted'}
                onChange={(e) => setFormData({ ...formData, timelineStage: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Application Submitted">Application Submitted</option>
                <option value="Admit Card">Admit Card</option>
                <option value="Prelims">Prelims</option>
                <option value="Mains">Mains</option>
                <option value="Interview">Interview</option>
                <option value="Document Verification">Document Verification</option>
                <option value="Exam Completed">Exam Completed</option>
              </select>
            </div>

            {/* Exam Date */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Exam Date / Notice</label>
              <input
                type="text"
                value={formData.examDate || ''}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                placeholder="e.g. 04-Oct-2026 or TBA"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Fee Status */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Application Fee & Status</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.applicationFee || ''}
                  onChange={(e) => setFormData({ ...formData, applicationFee: e.target.value })}
                  placeholder="e.g. ₹100 / ₹750"
                  className="w-2/3 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50"
                />
                <select
                  value={formData.feeStatus || 'Paid'}
                  onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value as any })}
                  className="w-1/3 px-2 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50"
                >
                  <option value="Paid">Paid</option>
                  <option value="Exempted">Exempted</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Qualification */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Minimum Qualification</label>
              <input
                type="text"
                value={formData.minQualification || ''}
                onChange={(e) => setFormData({ ...formData, minQualification: e.target.value })}
                placeholder="e.g. B.Tech / B.E. (Computer Science / IT) with 65% marks"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>

            {/* Key Prep */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Key Preparation Focus</label>
              <input
                type="text"
                value={formData.keyPrep || ''}
                onChange={(e) => setFormData({ ...formData, keyPrep: e.target.value })}
                placeholder="e.g. Core CS concepts, DBMS, OS, Data Structures, Gate-level numericals"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Notes & Tracking Reminders</label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Keep registration printout; check admit card notification daily..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
