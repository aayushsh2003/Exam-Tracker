export type PriorityLevel = 'Very High' | 'High' | 'Medium' | 'Low';

export type FeeStatusType = 'Paid' | 'Exempted' | 'Verify' | 'Pending';

export type ApplicationStatusType = 'Applied' | 'Under Review' | 'Completed' | 'Shortlisted' | 'Withdrawn';

export type TimelineStageType = 
  | 'Application Submitted' 
  | 'Admit Card' 
  | 'Prelims' 
  | 'Mains' 
  | 'Interview' 
  | 'Document Verification' 
  | 'Exam Completed';

export type CompletionOutcomeType = 
  | 'Attempted - Awaiting Result'
  | 'Answer Key Checked'
  | 'Qualified for Next Stage / Mains'
  | 'Selected / In Merit List'
  | 'Not Qualified / Attempt Complete';

export interface DocumentChecklist {
  applicationPdf: boolean;
  feeReceipt: boolean;
  idProof: boolean;
  degreeCerts: boolean;
  admitCard: boolean;
}

export interface StageStatusChecklist {
  applicationConfirmed: boolean;
  admitCardDownloaded: boolean;
  examAttempted: boolean;
  answerKeyChecked: boolean;
  resultAnnounced: boolean;
  nextStageQualified: boolean;
}

export interface ExamItem {
  id: string;
  examName: string;
  postTitle: string;
  organization: string;
  minQualification: string;
  selectionProcess: string;
  applicationFee: string;
  feeStatus: FeeStatusType;
  status: ApplicationStatusType;
  category: string;
  advertisementNo: string;
  advertisementDate: string;
  applicationStart: string;
  applicationDeadline: string;
  deadlineIso?: string;
  examDate: string;
  examDateIso?: string;
  admitCard: string;
  result: string;
  timelineStage: TimelineStageType;
  priority: PriorityLevel;
  keyPrep: string;
  documentsRequired: string;
  officialSource: string;
  sourceUrl?: string;
  notes: string;
  documentsReady: DocumentChecklist;
  stageStatus: StageStatusChecklist;
  isCompleted?: boolean;
  completedDate?: string;
  scoreMarks?: string;
  completionOutcome?: CompletionOutcomeType;
  completionNotes?: string;
  updatedAt?: string;
}

export interface MilestoneAction {
  id: string;
  date: string;
  dateIso?: string;
  examPost: string;
  milestone: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  completed: boolean;
  relatedExamId?: string;
}

export interface ImportantReference {
  id: string;
  item: string;
  whatToKeep: string;
  sourceVerification: string;
  portalUrl?: string;
  category: string;
  checklistItems: string[];
}

export type ActiveTab = 'dashboard' | 'master' | 'timeline' | 'calendar' | 'actions' | 'stageTracker' | 'references' | 'aiAdvisor';
