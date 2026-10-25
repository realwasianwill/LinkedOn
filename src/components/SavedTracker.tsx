import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Download,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ApplicationStatus, Job, SavedJobEntry } from '../types';
import { exportSavedJobsCsv } from '../utils/storage';

interface SavedTrackerProps {
  savedMap: Record<string, SavedJobEntry>;
  onSelectJob: (job: Job) => void;
  onRemoveJob: (job: Job) => void;
  onChangeStatus: (job: Job, status: ApplicationStatus) => void;
  onChangeNotes: (jobId: string, notes: string) => void;
  onBrowseJobs: () => void;
}

const COLUMNS: { key: ApplicationStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All Tracked' },
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offer', label: 'Offer' },
];

export const SavedTracker: React.FC<SavedTrackerProps> = ({
  savedMap,
  onSelectJob,
  onRemoveJob,
  onChangeStatus,
  onChangeNotes,
  onBrowseJobs,
}) => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');

  const entries = useMemo(() => {
    const list = Object.values(savedMap).sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
    if (statusFilter === 'all') return list;
    return list.filter((e) => e.status === statusFilter);
  }, [savedMap, statusFilter]);

  const allEntries = Object.values(savedMap);

  if (allEntries.length === 0) {
    return (
      <div className="bg-white dark:bg-[#131C2E] rounded-2xl border border-[#E4E1D8] dark:border-[#22304A] p-10 text-center max-w-2xl mx-auto my-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-700/10 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto">
          <Bookmark className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Your Direct-Career Shortlist Is Empty
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Bookmark Online or Hybrid roles as you browse, or click any{' '}
          <strong className="font-semibold">Company Career URL</strong> button to track where you’ve applied — stored 100% locally in your browser with zero account sign-up.
        </p>
        <button
          type="button"
          onClick={onBrowseJobs}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-700 hover:bg-teal-800 text-white transition-colors cursor-pointer"
        >
          Browse Global Roles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-[#131C2E] rounded-2xl border border-[#E4E1D8] dark:border-[#22304A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Personal Direct-URL Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Track roles you’ve opened on company career sites — private in your browser, $0 account wall, exportable anytime.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportSavedJobsCsv(allEntries)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 transition-colors shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV ({allEntries.length})</span>
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {COLUMNS.map((col) => {
          const count =
            col.key === 'all'
              ? allEntries.length
              : allEntries.filter((e) => e.status === col.key).length;
          const active = statusFilter === col.key;
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => setStatusFilter(col.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                active
                  ? 'bg-teal-700 text-white border-teal-700 dark:bg-teal-500 dark:text-slate-950 dark:border-teal-500'
                  : 'bg-white dark:bg-[#131C2E] text-slate-600 dark:text-slate-300 border-[#E2DFD5] dark:border-[#24324D]'
              }`}
            >
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tracked Cards */}
      <div className="space-y-3">
        {entries.map(({ job, status, notes }) => (
          <div
            key={job.id}
            className="bg-white dark:bg-[#131C2E] rounded-2xl border border-[#E4E1D8] dark:border-[#22304A] p-5 space-y-3"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div
                onClick={() => onSelectJob(job)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  style={{ backgroundColor: job.companyColor }}
                  className="w-10 h-10 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0"
                >
                  {job.companyInitials}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400">
                    {job.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {job.companyName}
                    </span>
                    <span>·</span>
                    <span>{job.locationLabel}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-mono-url text-teal-800 dark:text-teal-300">
                      <ShieldCheck className="w-3 h-3" />
                      {job.displayUrl}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label={`Application status for ${job.title}`}
                  value={status}
                  onChange={(e) =>
                    onChangeStatus(job, e.target.value as ApplicationStatus)
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF9F6] dark:bg-[#0D1422] border border-[#DFDCD2] dark:border-[#263552] text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                </select>

                <a
                  href={job.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-700 hover:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950"
                >
                  <span>Company URL</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => onRemoveJob(job)}
                  title="Remove from tracker"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={notes}
              onChange={(e) => onChangeNotes(job.id, e.target.value)}
              placeholder="Add quick interview or referral note..."
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-[#FAF9F6] dark:bg-[#0D1422] border border-[#E5E2DA] dark:border-[#23314B] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
