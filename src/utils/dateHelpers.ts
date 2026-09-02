export function getDaysRemaining(targetDateIso?: string): { days: number; text: string; isPast: boolean; isToday: boolean } {
  if (!targetDateIso) {
    return { days: 0, text: 'Date TBA', isPast: false, isToday: false };
  }

  // Reference date aligned with the dataset timestamp (2026-09-01)
  const today = new Date('2026-09-01T00:00:00');
  const target = new Date(targetDateIso);

  if (isNaN(target.getTime())) {
    return { days: 0, text: 'Date TBA', isPast: false, isToday: false };
  }

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, text: 'Today', isPast: false, isToday: true };
  } else if (diffDays > 0) {
    return { days: diffDays, text: `In ${diffDays} day${diffDays === 1 ? '' : 's'}`, isPast: false, isToday: false };
  } else {
    const absDays = Math.abs(diffDays);
    return { days: diffDays, text: `${absDays} day${absDays === 1 ? '' : 's'} ago`, isPast: true, isToday: false };
  }
}

export function formatIndianCurrency(amountStr: string): string {
  return amountStr;
}

export function getPriorityBadgeColor(priority: string): { bg: string; text: string; border: string; dot: string } {
  switch (priority?.toLowerCase()) {
    case 'very high':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
    case 'high':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'medium':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  }
}

export function getCategoryBadgeColor(category: string): { bg: string; text: string; border: string } {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('banking')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  if (cat.includes('psu') || cat.includes('cs')) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
  }
  if (cat.includes('research') || cat.includes('scientific') || cat.includes('isro') || cat.includes('barc')) {
    return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
  }
  if (cat.includes('teaching') || cat.includes('tgt') || cat.includes('ctet')) {
    return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
  }
  if (cat.includes('rajasthan') || cat.includes('state')) {
    return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
  }
  if (cat.includes('regulator') || cat.includes('sebi')) {
    return { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' };
  }
  if (cat.includes('cyber') || cat.includes('forensic')) {
    return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
  }
  return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
}
