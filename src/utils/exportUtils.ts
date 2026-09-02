import { ExamItem, MilestoneAction } from '../types';

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
    'Key Preparation',
    'Documents Required',
    'Official Source',
    'Notes',
  ];

  const rows = exams.map((e) => [
    `"${e.examName.replace(/"/g, '""')}"`,
    `"${e.postTitle.replace(/"/g, '""')}"`,
    `"${e.organization.replace(/"/g, '""')}"`,
    `"${e.minQualification.replace(/"/g, '""')}"`,
    `"${e.selectionProcess.replace(/"/g, '""')}"`,
    `"${e.applicationFee.replace(/"/g, '""')}"`,
    `"${e.feeStatus}"`,
    `"${e.status}"`,
    `"${e.category.replace(/"/g, '""')}"`,
    `"${e.advertisementDate}"`,
    `"${e.applicationStart}"`,
    `"${e.applicationDeadline}"`,
    `"${e.examDate.replace(/"/g, '""')}"`,
    `"${e.admitCard.replace(/"/g, '""')}"`,
    `"${e.result.replace(/"/g, '""')}"`,
    `"${e.timelineStage}"`,
    `"${e.priority}"`,
    `"${e.keyPrep.replace(/"/g, '""')}"`,
    `"${e.documentsRequired.replace(/"/g, '""')}"`,
    `"${e.officialSource.replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `2026_Exam_Master_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAllDataToJson(exams: ExamItem[], milestones: MilestoneAction[]) {
  const data = {
    version: '2026.1',
    exportDate: new Date().toISOString(),
    examsCount: exams.length,
    milestonesCount: milestones.length,
    exams,
    milestones,
  };

  const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', jsonStr);
  link.setAttribute('download', `2026_Exam_Tracker_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerPrint() {
  window.print();
}
