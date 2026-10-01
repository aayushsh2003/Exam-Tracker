import { ExamItem, MilestoneAction, ExamCategoryGroup } from '../types';

export interface CategorizedExamJson {
  completedAnnounced: Array<{
    id: number | string;
    exam: string;
    post: string;
    prevExamDate: string;
    fee: number;
    status: string;
    link: string;
  }>;
  completedAwaited: Array<{
    id: number | string;
    exam: string;
    post: string;
    prevExamDate: string;
    fee: number;
    status: string;
    link: string;
  }>;
  upcomingActive: Array<{
    order: number;
    exam: string;
    post: string;
    date: string;
    fee: number;
    status: string;
    link: string;
  }>;
  awaitingDate: Array<{
    id: number | string;
    exam: string;
    post: string;
    fee: number;
    status: string;
    link: string;
  }>;
}

export function parseFeeNumber(feeStr: string | number | undefined): number {
  if (typeof feeStr === 'number') return feeStr;
  if (!feeStr) return 0;
  const match = feeStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Builds the exact 4-category JSON structure requested by the user
 */
export function buildCategorizedExamJson(exams: ExamItem[]): CategorizedExamJson {
  const result: CategorizedExamJson = {
    completedAnnounced: [],
    completedAwaited: [],
    upcomingActive: [],
    awaitingDate: [],
  };

  exams.forEach((exam, index) => {
    const feeNum = parseFeeNumber(exam.applicationFee);
    const link = exam.sourceUrl || exam.officialSource || 'https://example.gov.in';

    // Determine category group
    let group: ExamCategoryGroup = exam.categoryGroup || 'upcomingActive';

    if (exam.categoryGroup) {
      group = exam.categoryGroup;
    } else if (
      exam.statusTag?.includes('Not Qualified') ||
      exam.completionOutcome === 'Not Qualified / Attempt Complete'
    ) {
      group = 'completedAnnounced';
    } else if (
      exam.statusTag?.includes('awaited') ||
      exam.statusTag?.includes('next stage') ||
      exam.isCompleted ||
      exam.timelineStage === 'Exam Completed'
    ) {
      group = 'completedAwaited';
    } else if (exam.examDate.includes('TBA') || exam.statusTag?.includes('TBA')) {
      group = 'awaitingDate';
    } else {
      group = 'upcomingActive';
    }

    const numOrStrId: number | string = !isNaN(Number(exam.id)) ? Number(exam.id) : (index + 1);

    if (group === 'completedAnnounced') {
      result.completedAnnounced.push({
        id: numOrStrId,
        exam: exam.examName,
        post: exam.postTitle,
        prevExamDate: exam.prevExamDate || exam.examDate,
        fee: feeNum,
        status: exam.statusTag || '❌ Exam completed — result announced (Not Qualified)',
        link,
      });
    } else if (group === 'completedAwaited') {
      result.completedAwaited.push({
        id: numOrStrId,
        exam: exam.examName,
        post: exam.postTitle,
        prevExamDate: exam.prevExamDate || exam.examDate,
        fee: feeNum,
        status: exam.statusTag || '✅ Exam completed — result awaited',
        link,
      });
    } else if (group === 'awaitingDate') {
      result.awaitingDate.push({
        id: numOrStrId,
        exam: exam.examName,
        post: exam.postTitle,
        fee: feeNum,
        status: exam.statusTag || '🟡 Applied — date TBA',
        link,
      });
    } else {
      const order = exam.displayOrder || (result.upcomingActive.length + 1);
      result.upcomingActive.push({
        order,
        exam: exam.examName,
        post: exam.postTitle,
        date: exam.examDate,
        fee: feeNum,
        status: exam.statusTag || '✅ Confirmed',
        link,
      });
    }
  });

  // Sort upcomingActive by order
  result.upcomingActive.sort((a, b) => a.order - b.order);

  return result;
}

export function exportCategorizedJson(exams: ExamItem[]) {
  const categorized = buildCategorizedExamJson(exams);
  const jsonString = JSON.stringify(categorized, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `2026_Exams_Categorized_Status_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

export function exportAllDataToJson(exams: ExamItem[], milestones: MilestoneAction[] = []) {
  const categorized = buildCategorizedExamJson(exams);
  const data = {
    app: '2026-competitive-exam-tracker',
    version: '2026.3',
    exportDate: new Date().toISOString(),
    examsCount: exams.length,
    milestonesCount: milestones.length,
    categorizedSummary: {
      completedAnnounced: categorized.completedAnnounced.length,
      completedAwaited: categorized.completedAwaited.length,
      upcomingActive: categorized.upcomingActive.length,
      awaitingDate: categorized.awaitingDate.length,
    },
    exams,
    categorizedData: categorized,
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
    'ID / Order',
    'Category Group',
    'Status Tag',
    'Exam / Recruitment',
    'Post / Domain',
    'Organization',
    'Application Fee',
    'Fee Status',
    'Status',
    'Exam Date',
    'Previous Exam Date',
    'Timeline Stage',
    'Priority',
    'Result / Outcome',
    'Score / Marks',
    'Official Link',
    'Notes',
  ];

  const rows = exams.map((e, index) => [
    `"${e.displayOrder || e.id || index + 1}"`,
    `"${e.categoryGroup || ''}"`,
    `"${(e.statusTag || '').replace(/"/g, '""')}"`,
    `"${(e.examName || '').replace(/"/g, '""')}"`,
    `"${(e.postTitle || '').replace(/"/g, '""')}"`,
    `"${(e.organization || '').replace(/"/g, '""')}"`,
    `"${(e.applicationFee || '').replace(/"/g, '""')}"`,
    `"${e.feeStatus || 'Paid'}"`,
    `"${e.status || 'Applied'}"`,
    `"${(e.examDate || '').replace(/"/g, '""')}"`,
    `"${(e.prevExamDate || '').replace(/"/g, '""')}"`,
    `"${e.timelineStage || 'Application Submitted'}"`,
    `"${e.priority || 'Medium'}"`,
    `"${(e.completionOutcome || e.result || '').replace(/"/g, '""')}"`,
    `"${(e.scoreMarks || '').replace(/"/g, '""')}"`,
    `"${(e.sourceUrl || e.officialSource || '').replace(/"/g, '""')}"`,
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
  formatDetected?: 'categorized' | 'standard' | 'backup';
} {
  try {
    const parsed = JSON.parse(rawContent);
    let extractedMilestones: MilestoneAction[] = [];
    let formatDetected: 'categorized' | 'standard' | 'backup' = 'standard';

    // 1. Check if it's the 4-category format provided by user
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      (Array.isArray(parsed.completedAnnounced) ||
        Array.isArray(parsed.completedAwaited) ||
        Array.isArray(parsed.upcomingActive) ||
        Array.isArray(parsed.awaitingDate))
    ) {
      formatDetected = 'categorized';
      const sanitizedExams: ExamItem[] = [];

      // A: completedAnnounced
      if (Array.isArray(parsed.completedAnnounced)) {
        parsed.completedAnnounced.forEach((item: any, idx: number) => {
          const id = String(item.id || `completed-announced-${idx + 1}`);
          const feeVal = item.fee !== undefined ? (item.fee === 0 ? '₹0' : `₹${item.fee}`) : '₹500';
          sanitizedExams.push({
            id,
            examName: String(item.exam || item.examName || `Exam ${idx + 1}`),
            postTitle: String(item.post || item.postTitle || 'Technical Post'),
            organization: inferOrganization(item.exam || item.examName),
            minQualification: 'Relevant Technical Degree / Graduation',
            selectionProcess: 'Screening Test / Exam → Result Declared',
            applicationFee: feeVal,
            feeStatus: item.fee === 0 ? 'Exempted' : 'Paid',
            status: 'Completed',
            category: inferCategory(item.exam || item.examName, item.post || item.postTitle),
            advertisementNo: `ADVT-${item.id || idx + 1}`,
            advertisementDate: item.prevExamDate || 'Past cycle',
            applicationStart: 'Closed',
            applicationDeadline: 'Closed',
            prevExamDate: item.prevExamDate || item.date || 'Past Exam',
            examDate: item.prevExamDate || item.date || 'Past Exam',
            admitCard: 'Exam completed',
            result: 'Result Announced (Not Qualified)',
            timelineStage: 'Exam Completed',
            priority: 'Medium',
            keyPrep: 'Review questions and foundational weaknesses',
            documentsRequired: 'Application PDF, Fee receipt, ID proof',
            officialSource: item.link || 'https://example.gov.in',
            sourceUrl: item.link,
            notes: `Exam completed on ${item.prevExamDate || 'schedule'}. Official result declared: Not Qualified.`,
            statusTag: item.status || '❌ Exam completed — result announced (Not Qualified)',
            categoryGroup: 'completedAnnounced',
            isCompleted: true,
            completionOutcome: 'Not Qualified / Attempt Complete',
            completedDate: item.prevExamDate || 'Completed',
            stageStatus: {
              applicationConfirmed: true,
              admitCardDownloaded: true,
              examAttempted: true,
              answerKeyChecked: true,
              resultAnnounced: true,
              nextStageQualified: false,
            },
            documentsReady: {
              applicationPdf: true,
              feeReceipt: true,
              idProof: true,
              degreeCerts: true,
              admitCard: true,
            },
            updatedAt: new Date().toISOString(),
          });
        });
      }

      // B: completedAwaited
      if (Array.isArray(parsed.completedAwaited)) {
        parsed.completedAwaited.forEach((item: any, idx: number) => {
          const id = String(item.id || `completed-awaited-${idx + 1}`);
          const feeVal = item.fee !== undefined ? (item.fee === 0 ? '₹0' : `₹${item.fee}`) : '₹750';
          const isNextStage = item.status && item.status.toLowerCase().includes('next stage');
          sanitizedExams.push({
            id,
            examName: String(item.exam || item.examName || `Exam ${idx + 1}`),
            postTitle: String(item.post || item.postTitle || 'Recruitment Post'),
            organization: inferOrganization(item.exam || item.examName),
            minQualification: 'Graduation / Relevant Engineering Degree',
            selectionProcess: 'CBT / Screening Exam → Result / Next Stage',
            applicationFee: feeVal,
            feeStatus: item.fee === 0 ? 'Exempted' : 'Paid',
            status: 'Completed',
            category: inferCategory(item.exam || item.examName, item.post || item.postTitle),
            advertisementNo: `ADVT-${item.id || idx + 1}`,
            advertisementDate: item.prevExamDate || '2026',
            applicationStart: 'Closed',
            applicationDeadline: 'Closed',
            prevExamDate: item.prevExamDate || item.date || '2026',
            examDate: item.prevExamDate || item.date || '2026',
            admitCard: 'Exam completed',
            result: isNextStage ? 'CBT completed — result/next stage call awaited' : 'Exam completed — result awaited',
            timelineStage: 'Exam Completed',
            priority: 'High',
            keyPrep: 'Prepare documentation & next stage syllabus while awaiting result',
            documentsRequired: 'Application copy, Fee receipt, Marksheets, ID Proof',
            officialSource: item.link || 'https://example.gov.in',
            sourceUrl: item.link,
            notes: `Exam completed on ${item.prevExamDate || 'schedule'}. Official result/next stage announcement awaited.`,
            statusTag: item.status || (isNextStage ? '✅ CBT completed — result/next stage' : '✅ Exam completed — result awaited'),
            categoryGroup: 'completedAwaited',
            isCompleted: true,
            completionOutcome: isNextStage ? 'CBT Completed - Result / Next Stage' : 'Attempted - Awaiting Result',
            completedDate: item.prevExamDate || 'Completed',
            stageStatus: {
              applicationConfirmed: true,
              admitCardDownloaded: true,
              examAttempted: true,
              answerKeyChecked: true,
              resultAnnounced: false,
              nextStageQualified: false,
            },
            documentsReady: {
              applicationPdf: true,
              feeReceipt: true,
              idProof: true,
              degreeCerts: true,
              admitCard: true,
            },
            updatedAt: new Date().toISOString(),
          });
        });
      }

      // C: upcomingActive
      if (Array.isArray(parsed.upcomingActive)) {
        parsed.upcomingActive.forEach((item: any, idx: number) => {
          const order = Number(item.order || idx + 1);
          const id = String(item.id || `upcoming-${order}`);
          const feeVal = item.fee !== undefined ? (item.fee === 0 ? '₹0' : `₹${item.fee}`) : '₹850';
          const isMains = item.exam && item.exam.toLowerCase().includes('mains');
          const isPaper2 = item.exam && (item.exam.toLowerCase().includes('paper-ii') || item.exam.toLowerCase().includes('paper 2'));
          
          sanitizedExams.push({
            id,
            displayOrder: order,
            examName: String(item.exam || item.examName || `Exam ${idx + 1}`),
            postTitle: String(item.post || item.postTitle || 'Officer / Associate'),
            organization: inferOrganization(item.exam || item.examName),
            minQualification: 'Graduation / B.E. / B.Tech / Relevant Degree',
            selectionProcess: isMains ? 'Mains Examination → Selection' : 'Prelims / CBT → Mains',
            applicationFee: feeVal,
            feeStatus: item.fee === 0 ? 'Exempted' : 'Paid',
            status: 'Applied',
            category: inferCategory(item.exam || item.examName, item.post || item.postTitle),
            advertisementNo: `2026/CRP-${order}`,
            advertisementDate: '2026',
            applicationStart: 'Active / Completed',
            applicationDeadline: 'Completed',
            examDate: String(item.date || item.examDate || 'Scheduled'),
            admitCard: 'Expected 7-10 days before exam date',
            result: 'Pending examination',
            timelineStage: (isMains || isPaper2) ? 'Mains' : 'Prelims',
            priority: (item.status && item.status.includes('Confirmed')) ? 'Very High' : 'High',
            keyPrep: 'Focused revision on domain subjects, speed test series & mock exams',
            documentsRequired: 'Application confirmation, Call Letter/Admit card, Original ID proof',
            officialSource: item.link || 'https://example.gov.in',
            sourceUrl: item.link,
            notes: `Confirmed/Scheduled date: ${item.date}. Verify hall ticket on official portal.`,
            statusTag: item.status || '✅ Confirmed',
            categoryGroup: 'upcomingActive',
            isCompleted: false,
            stageStatus: {
              applicationConfirmed: true,
              admitCardDownloaded: false,
              examAttempted: false,
              answerKeyChecked: false,
              resultAnnounced: false,
              nextStageQualified: false,
            },
            documentsReady: {
              applicationPdf: true,
              feeReceipt: true,
              idProof: true,
              degreeCerts: true,
              admitCard: false,
            },
            updatedAt: new Date().toISOString(),
          });
        });
      }

      // D: awaitingDate
      if (Array.isArray(parsed.awaitingDate)) {
        parsed.awaitingDate.forEach((item: any, idx: number) => {
          const id = String(item.id || `awaiting-date-${idx + 1}`);
          const feeVal = item.fee !== undefined ? (item.fee === 0 ? '₹0' : `₹${item.fee}`) : '₹100';

          sanitizedExams.push({
            id,
            examName: String(item.exam || item.examName || `Exam ${idx + 1}`),
            postTitle: String(item.post || item.postTitle || 'Recruitment Post'),
            organization: inferOrganization(item.exam || item.examName),
            minQualification: 'Relevant 12th / Diploma / Graduate Degree',
            selectionProcess: 'Tier-I / Written CBT Exam → Document Verification',
            applicationFee: feeVal,
            feeStatus: item.fee === 0 ? 'Exempted' : 'Paid',
            status: 'Applied',
            category: inferCategory(item.exam || item.examName, item.post || item.postTitle),
            advertisementNo: `Advt. 2026-${item.id || idx + 1}`,
            advertisementDate: '2026',
            applicationStart: 'Completed',
            applicationDeadline: 'Closed',
            examDate: 'TBA (Watch official recruitment portal)',
            admitCard: 'TBA after exam date notification',
            result: 'TBA',
            timelineStage: 'Application Submitted',
            priority: 'High',
            keyPrep: 'Complete foundational syllabus revision and keep documents ready',
            documentsRequired: 'Application form PDF, Fee payment receipt, Qualification marksheets',
            officialSource: item.link || 'https://example.gov.in',
            sourceUrl: item.link,
            notes: 'Application registered successfully. Official date announcement awaited.',
            statusTag: item.status || '🟡 Applied — date TBA',
            categoryGroup: 'awaitingDate',
            isCompleted: false,
            stageStatus: {
              applicationConfirmed: true,
              admitCardDownloaded: false,
              examAttempted: false,
              answerKeyChecked: false,
              resultAnnounced: false,
              nextStageQualified: false,
            },
            documentsReady: {
              applicationPdf: true,
              feeReceipt: true,
              idProof: true,
              degreeCerts: true,
              admitCard: false,
            },
            updatedAt: new Date().toISOString(),
          });
        });
      }

      return {
        success: true,
        exams: sanitizedExams,
        count: sanitizedExams.length,
        formatDetected,
      };
    }

    // 2. Standard or Full Backup JSON format
    let extractedExams: any[] = [];
    if (Array.isArray(parsed)) {
      extractedExams = parsed;
    } else if (parsed && typeof parsed === 'object') {
      formatDetected = 'backup';
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
        error: 'No valid exam items found in this JSON file. Expected an array of exams, backup object, or 4-category structure.',
      };
    }

    // Sanitize standard items
    const sanitizedExams: ExamItem[] = extractedExams.map((item, index) => {
      const id = String(item.id || `exam-${Date.now()}-${index}`);
      const examName = String(item.examName || item.exam || item.name || `Exam #${index + 1}`);
      const postTitle = String(item.postTitle || item.post || item.title || 'Recruitment Post');
      const organization = String(item.organization || item.org || inferOrganization(examName));
      const priority = (item.priority === 'Very High' || item.priority === 'High' || item.priority === 'Medium' || item.priority === 'Low') 
        ? item.priority 
        : 'Medium';
      const status = (item.status === 'Applied' || item.status === 'Shortlisted' || item.status === 'Completed' || item.status === 'Upcoming' || item.status === 'Closed')
        ? item.status
        : (item.isCompleted ? 'Completed' : 'Applied');

      const isCompleted = Boolean(
        item.isCompleted ||
        item.timelineStage === 'Exam Completed' ||
        status === 'Completed' ||
        (item.statusTag && (item.statusTag.includes('completed') || item.statusTag.includes('Not Qualified')))
      );

      const timelineStage = (
        item.timelineStage === 'Application Submitted' ||
        item.timelineStage === 'Admit Card' ||
        item.timelineStage === 'Prelims' ||
        item.timelineStage === 'Mains' ||
        item.timelineStage === 'Interview' ||
        item.timelineStage === 'Document Verification' ||
        item.timelineStage === 'Exam Completed'
      ) ? item.timelineStage : (isCompleted ? 'Exam Completed' : 'Application Submitted');

      const appFee = typeof item.fee === 'number'
        ? (item.fee === 0 ? '₹0' : `₹${item.fee}`)
        : String(item.applicationFee || '₹0');

      return {
        id,
        examName,
        postTitle,
        organization,
        minQualification: String(item.minQualification || 'Graduate / Relevant Degree'),
        selectionProcess: String(item.selectionProcess || 'Written Exam / CBT'),
        applicationFee: appFee,
        feeStatus: (item.feeStatus === 'Exempted' || item.fee === 0) ? 'Exempted' : (item.feeStatus === 'Pending' ? 'Pending' : 'Paid'),
        status: isCompleted ? 'Completed' : status,
        category: String(item.category || inferCategory(examName, postTitle)),
        advertisementNo: String(item.advertisementNo || item.advtNo || item.advertisementDate || '2026/01'),
        advertisementDate: String(item.advertisementDate || '2026'),
        applicationStart: String(item.applicationStart || '2026'),
        applicationDeadline: String(item.applicationDeadline || '2026'),
        deadlineIso: item.deadlineIso ? String(item.deadlineIso) : undefined,
        prevExamDate: item.prevExamDate ? String(item.prevExamDate) : undefined,
        examDate: String(item.date || item.examDate || '2026 (TBA)'),
        examDateIso: item.examDateIso ? String(item.examDateIso) : undefined,
        admitCard: String(item.admitCard || (isCompleted ? 'Exam completed' : 'Expected 7-10 days before exam')),
        result: String(item.result || (isCompleted ? 'Result recorded' : 'TBA')),
        timelineStage,
        priority,
        keyPrep: String(item.keyPrep || 'Standard syllabus revision and practice tests'),
        documentsRequired: String(item.documentsRequired || 'Application PDF, Photo ID, Degree certificates'),
        officialSource: String(item.officialSource || item.link || 'https://example.gov.in'),
        sourceUrl: item.sourceUrl || item.link || undefined,
        notes: String(item.notes || ''),
        statusTag: item.statusTag || (typeof item.status === 'string' && item.status.includes(' ') ? item.status : undefined),
        categoryGroup: item.categoryGroup,
        displayOrder: item.order ? Number(item.order) : (item.displayOrder ? Number(item.displayOrder) : undefined),
        scoreMarks: item.scoreMarks ? String(item.scoreMarks) : undefined,
        completionOutcome: item.completionOutcome || undefined,
        completionNotes: item.completionNotes ? String(item.completionNotes) : undefined,
        completedDate: item.completedDate || item.prevExamDate || undefined,
        isCompleted,
        stageStatus: {
          applicationConfirmed: item.stageStatus?.applicationConfirmed ?? true,
          admitCardDownloaded: item.stageStatus?.admitCardDownloaded ?? (timelineStage === 'Admit Card' || isCompleted),
          examAttempted: item.stageStatus?.examAttempted ?? isCompleted,
          answerKeyChecked: item.stageStatus?.answerKeyChecked ?? false,
          resultAnnounced: item.stageStatus?.resultAnnounced ?? false,
          nextStageQualified: item.stageStatus?.nextStageQualified ?? false,
        },
        documentsReady: {
          applicationPdf: item.documentsReady?.applicationPdf ?? true,
          feeReceipt: item.documentsReady?.feeReceipt ?? true,
          admitCard: item.documentsReady?.admitCard ?? (timelineStage === 'Admit Card' || isCompleted),
          idProof: item.documentsReady?.idProof ?? true,
          degreeCerts: item.documentsReady?.degreeCerts ?? true,
        },
        updatedAt: item.updatedAt || new Date().toISOString(),
      };
    });

    return {
      success: true,
      exams: sanitizedExams,
      milestones: extractedMilestones.length > 0 ? extractedMilestones : undefined,
      count: sanitizedExams.length,
      formatDetected,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `JSON Syntax Error: ${err.message || 'The file is not a valid JSON document.'}`,
    };
  }
}

function inferOrganization(examName: string): string {
  const lower = (examName || '').toLowerCase();
  if (lower.includes('barc')) return 'Bhabha Atomic Research Centre (BARC)';
  if (lower.includes('sebi')) return 'Securities and Exchange Board of India (SEBI)';
  if (lower.includes('ib / mha') || lower.includes('intelligence bureau')) return 'Intelligence Bureau / MHA';
  if (lower.includes('sbi')) return 'State Bank of India (SBI)';
  if (lower.includes('cil') || lower.includes('coal india')) return 'Coal India Limited (CIL)';
  if (lower.includes('indianoil') || lower.includes('iocl')) return 'Indian Oil Corporation Limited (IOCL)';
  if (lower.includes('rssb')) return 'Rajasthan Staff Selection Board (RSSB)';
  if (lower.includes('ibps')) return 'IBPS';
  if (lower.includes('isro')) return 'ISRO';
  if (lower.includes('aai')) return 'Airports Authority of India (AAI)';
  if (lower.includes('rrb')) return 'Railway Recruitment Boards (RRB)';
  if (lower.includes('ssc')) return 'Staff Selection Commission (SSC)';
  if (lower.includes('gate')) return 'GATE Committee / IIT';
  if (lower.includes('dsssb')) return 'Delhi Subordinate Services Selection Board (DSSSB)';
  return 'Government / PSU Authority';
}

function inferCategory(examName: string, postTitle: string): string {
  const combined = `${examName || ''} ${postTitle || ''}`.toLowerCase();
  if (combined.includes('gate')) return 'National Engineering / CS';
  if (combined.includes('bank') || combined.includes('ibps') || combined.includes('sbi')) return 'Banking';
  if (combined.includes('isro') || combined.includes('barc')) return 'Research / Scientific';
  if (combined.includes('railway') || combined.includes('rrb')) return 'Railways / Engineering';
  if (combined.includes('ssc')) return 'Central Govt / SSC';
  if (combined.includes('dsssb')) return 'Delhi State / DSSSB';
  if (combined.includes('rssb') || combined.includes('cet')) return 'Rajasthan State';
  if (combined.includes('cil') || combined.includes('iocl') || combined.includes('aai')) return 'PSU + CS';
  if (combined.includes('sebi')) return 'Regulatory / Finance';
  return 'Competitive Recruitment';
}

export function triggerPrint() {
  window.print();
}
