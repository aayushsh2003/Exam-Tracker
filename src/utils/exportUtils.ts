import { ExamItem, MilestoneAction } from '../types';

export function exportAllDataToJson(exams: ExamItem[], milestones: MilestoneAction[] = []) {
  const data = {
    app: '2026-competitive-exam-tracker',
    version: '2026.2',
    exportDate: new Date().toISOString(),
    examsCount: exams.length,
    milestonesCount: milestones.length,
    exams,
    milestones,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `2026_Exam_Tracker_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

export function exportExamsOnlyToJson(exams: ExamItem[]) {
  const jsonString = JSON.stringify(exams, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `2026_Exams_Dataset_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

export function exportExamsToCsv(exams: ExamItem[]) {
  const headers = [
    'Exam / Recruitment',
    'Post / Domain',
    'Organization',
    'Minimum Qualification',
    'Selection Process',
    'Application Fee',
    'Fee Status',
    'Status',
    'Category',
    'Advertisement Date',
    'Application Start',
    'Application Deadline',
    'Exam Date',
    'Admit Card',
    'Result / Next Stage',
    'Timeline Stage',
    'Priority',
    'Score / Marks',
    'Completion Outcome',
    'Key Preparation',
    'Documents Required',
    'Official Source',
    'Notes',
  ];

  const rows = exams.map((e) => [
    `"${(e.examName || '').replace(/"/g, '""')}"`,
    `"${(e.postTitle || '').replace(/"/g, '""')}"`,
    `"${(e.organization || '').replace(/"/g, '""')}"`,
    `"${(e.minQualification || '').replace(/"/g, '""')}"`,
    `"${(e.selectionProcess || '').replace(/"/g, '""')}"`,
    `"${(e.applicationFee || '').replace(/"/g, '""')}"`,
    `"${e.feeStatus || 'Paid'}"`,
    `"${e.status || 'Applied'}"`,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    `"${e.advertisementDate || ''}"`,
    `"${e.applicationStart || ''}"`,
    `"${e.applicationDeadline || ''}"`,
    `"${(e.examDate || '').replace(/"/g, '""')}"`,
    `"${(e.admitCard || '').replace(/"/g, '""')}"`,
    `"${(e.result || '').replace(/"/g, '""')}"`,
    `"${e.timelineStage || 'Application Submitted'}"`,
    `"${e.priority || 'Medium'}"`,
    `"${(e.scoreMarks || '').replace(/"/g, '""')}"`,
    `"${(e.completionOutcome || '').replace(/"/g, '""')}"`,
    `"${(e.keyPrep || '').replace(/"/g, '""')}"`,
    `"${(e.documentsRequired || '').replace(/"/g, '""')}"`,
    `"${(e.officialSource || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `2026_Exam_Master_Tracker_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

export function parseAndValidateExamJson(rawContent: string): {
  success: boolean;
  exams?: ExamItem[];
  milestones?: MilestoneAction[];
  error?: string;
  count?: number;
} {
  try {
    const parsed = JSON.parse(rawContent);
    let extractedExams: any[] = [];
    let extractedMilestones: MilestoneAction[] = [];

    if (Array.isArray(parsed)) {
      extractedExams = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.exams)) {
        extractedExams = parsed.exams;
      } else if (Array.isArray(parsed.data)) {
        extractedExams = parsed.data;
      } else if (Array.isArray(parsed.items)) {
        extractedExams = parsed.items;
      }

      if (Array.isArray(parsed.milestones)) {
        extractedMilestones = parsed.milestones;
      }
    }

    if (!extractedExams.length) {
      return {
        success: false,
        error: 'No valid exam items found in this JSON file. Expected an array of exams or an object with an "exams" array.',
      };
    }

    // Sanitize and ensure each exam item conforms to ExamItem
    const sanitizedExams: ExamItem[] = extractedExams.map((item, index) => {
      const id = String(item.id || `exam-${Date.now()}-${index}`);
      const examName = String(item.examName || item.name || `Exam #${index + 1}`);
      const postTitle = String(item.postTitle || item.title || 'Recruitment Post');
      const organization = String(item.organization || item.org || 'Government / PSU');
      const priority = (item.priority === 'Very High' || item.priority === 'High' || item.priority === 'Medium' || item.priority === 'Low') 
        ? item.priority 
        : 'Medium';
      const status = (item.status === 'Applied' || item.status === 'Shortlisted' || item.status === 'Completed' || item.status === 'Upcoming' || item.status === 'Closed')
        ? item.status
        : 'Applied';
      const timelineStage = (
        item.timelineStage === 'Application Submitted' ||
        item.timelineStage === 'Admit Card' ||
        item.timelineStage === 'Prelims' ||
        item.timelineStage === 'Mains' ||
        item.timelineStage === 'Interview' ||
        item.timelineStage === 'Document Verification' ||
        item.timelineStage === 'Exam Completed'
      ) ? item.timelineStage : (item.isCompleted ? 'Exam Completed' : 'Application Submitted');

      return {
        id,
        examName,
        postTitle,
        organization,
        minQualification: String(item.minQualification || 'Graduate / Relevant Degree'),
        selectionProcess: String(item.selectionProcess || 'Written Exam / CBT'),
        applicationFee: String(item.applicationFee || '₹0'),
        feeStatus: item.feeStatus === 'Exempted' ? 'Exempted' : (item.feeStatus === 'Pending' ? 'Pending' : 'Paid'),
        status,
        category: String(item.category || 'General Recruitment'),
        advertisementNo: String(item.advertisementNo || item.advtNo || item.advertisementDate || '2026/01'),
        advertisementDate: String(item.advertisementDate || '2026'),
        applicationStart: String(item.applicationStart || '2026'),
        applicationDeadline: String(item.applicationDeadline || '2026'),
        deadlineIso: item.deadlineIso ? String(item.deadlineIso) : undefined,
        examDate: String(item.examDate || '2026 (TBA)'),
        examDateIso: item.examDateIso ? String(item.examDateIso) : undefined,
        admitCard: String(item.admitCard || 'Expected 7-10 days before exam'),
        result: String(item.result || 'TBA'),
        timelineStage,
        priority,
        keyPrep: String(item.keyPrep || 'Standard syllabus revision and practice tests'),
        documentsRequired: String(item.documentsRequired || 'Application PDF, Photo ID, Degree certificates'),
        officialSource: String(item.officialSource || 'https://example.gov.in'),
        sourceUrl: item.sourceUrl ? String(item.sourceUrl) : undefined,
        notes: String(item.notes || ''),
        scoreMarks: item.scoreMarks ? String(item.scoreMarks) : undefined,
        completionOutcome: item.completionOutcome || undefined,
        completionNotes: item.completionNotes ? String(item.completionNotes) : undefined,
        completedDate: item.completedDate || undefined,
        isCompleted: Boolean(item.isCompleted || timelineStage === 'Exam Completed' || status === 'Completed'),
        stageStatus: {
          applicationConfirmed: item.stageStatus?.applicationConfirmed ?? true,
          admitCardDownloaded: item.stageStatus?.admitCardDownloaded ?? (timelineStage === 'Admit Card'),
          examAttempted: item.stageStatus?.examAttempted ?? Boolean(item.isCompleted),
          answerKeyChecked: item.stageStatus?.answerKeyChecked ?? false,
          resultAnnounced: item.stageStatus?.resultAnnounced ?? false,
          nextStageQualified: item.stageStatus?.nextStageQualified ?? false,
        },
        documentsReady: {
          applicationPdf: item.documentsReady?.applicationPdf ?? true,
          feeReceipt: item.documentsReady?.feeReceipt ?? true,
          admitCard: item.documentsReady?.admitCard ?? (timelineStage === 'Admit Card'),
          idProof: item.documentsReady?.idProof ?? true,
          degreeCerts: item.documentsReady?.degreeCerts ?? item.documentsReady?.qualificationCerts ?? true,
        },
        updatedAt: item.updatedAt || new Date().toISOString(),
      };
    });

    return {
      success: true,
      exams: sanitizedExams,
      milestones: extractedMilestones.length > 0 ? extractedMilestones : undefined,
      count: sanitizedExams.length,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `JSON Syntax Error: ${err.message || 'The file is not a valid JSON document.'}`,
    };
  }
}

export function triggerPrint() {
  window.print();
}

