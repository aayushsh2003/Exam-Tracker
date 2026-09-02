import React, { useState } from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  FileText, 
  Info, 
  Search,
  Sparkles,
  Layers,
  FolderLock
} from 'lucide-react';
import { ImportantReference, ExamItem } from '../types';

interface ImportantReferencesViewProps {
  references: ImportantReference[];
  exams: ExamItem[];
  onSelectExam: (exam: ExamItem) => void;
  onOpenAiAdvisor: () => void;
}

export const ImportantReferencesView: React.FC<ImportantReferencesViewProps> = ({
  references,
  exams,
  onSelectExam,
  onOpenAiAdvisor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = references.filter(r => 
    !searchQuery ||
    r.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.whatToKeep.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.sourceVerification.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Bookmark className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Important References & Official Verification Vault
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct guidance from the "Important References" sheet: key advertisement post codes (41/26, 39/26, 28/26, 27/26), official recruitment verification portals, and document dossier checklists.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference or portal..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Universal Document Verification Locker Checklist */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Universal Document Readiness Checklist (All 20 Exams)</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Mandatory for DV
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Ensure these master copies are organized in both physical file folders and an encrypted digital cloud locker before admit card releases and interview calls:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {[
            'Submitted Application Form PDF (with visible Reg/Roll No)',
            'Online Fee Payment Challan / E-Receipt Copy',
            '10th Class Marksheet / Passing Certificate (DOB proof)',
            '12th / Senior Secondary Certificate & Marksheets',
            'B.Tech / Degree Certificate + All Semester Marksheets',
            'Category / Caste / EWS Certificate in Central/State format',
            'Government Photo ID Proofs (Aadhaar, PAN, Passport)',
            'Recent Passport-sized Photographs (identical to uploaded)',
            'Specialist Experience / Technical Portfolio / Publications',
          ].map((item, idx) => {
            const key = `master-doc-${idx}`;
            const isChecked = !!checkedItems[key];

            return (
              <div
                key={key}
                onClick={() => toggleCheck(key)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  isChecked
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <button className="mt-0.5 text-indigo-400">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <span className={`text-xs ${isChecked ? 'line-through text-emerald-300/80' : ''}`}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* References Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((ref) => {
          return (
            <div
              key={ref.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {ref.category}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-1.5">{ref.item}</h3>
                  </div>
                  {ref.portalUrl && (
                    <a
                      href={ref.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                      title="Open Official Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <strong className="text-slate-900 block font-semibold">What to keep / know:</strong>
                  <p className="leading-relaxed">{ref.whatToKeep}</p>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  <strong className="text-slate-700">Source / Verification:</strong> {ref.sourceVerification}
                </div>

                {ref.checklistItems && ref.checklistItems.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Specific Item Checklist:</span>
                    <div className="space-y-1.5">
                      {ref.checklistItems.map((chk, i) => {
                        const key = `${ref.id}-chk-${i}`;
                        const isDone = !!checkedItems[key];

                        return (
                          <div
                            key={key}
                            onClick={() => toggleCheck(key)}
                            className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none hover:text-indigo-600"
                          >
                            <button className="text-indigo-600">
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </button>
                            <span className={isDone ? 'line-through text-slate-400' : ''}>{chk}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {ref.portalUrl && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                    {ref.portalUrl}
                  </span>
                  <a
                    href={ref.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Launch Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
