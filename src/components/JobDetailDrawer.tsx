import React, { useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Building,
  Check,
  Clock,
  Copy,
  Globe2,
  Laptop,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ApplicationStatus, Job, SavedJobEntry } from '../types';

interface JobDetailDrawerProps {
  job: Job | null;
  savedEntry?: SavedJobEntry;
  onClose: () => void;
  onToggleSave: (job: Job) => void;
  onChangeStatus: (job: Job, status: ApplicationStatus) => void;
  onChangeNotes: (jobId: string, notes: string) => void;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
];

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  savedEntry,
  onClose,
  onToggleSave,
  onChangeStatus,
  onChangeNotes,
}) => {
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(job.directUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#FAF9F6] dark:bg-[#0E1525] h-full overflow-y-auto border-l border-[#E2DFD5] dark:border-[#22304A] shadow-2xl flex flex-col"
      >
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#FAF9F6]/95 dark:bg-[#0E1525]/95 backdrop-blur-md border-b border-[#E5E2DA] dark:border-[#1E293B]">
          <div className="flex items-center gap-2 text-xs font-mono-url text-teal-800 dark:text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>{job.verificationType} · $0 Middleman Fees</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close job details"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              style={{ backgroundColor: job.companyColor }}
              className="w-14 h-14 rounded-2xl text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs"
            >
              {job.companyInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {job.companyName}
                </span>
                {job.workMode === 'online' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-700/12 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Online (100% Remote)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-700/12 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                    <Building className="w-3.5 h-3.5" />
                    <span>Hybrid</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {job.title}
              </h2>
            </div>
          </div>

          {/* Direct URL Transparency Box */}
          <div className="rounded-2xl bg-white dark:bg-[#131C2E] border-2 border-teal-700/30 dark:border-teal-400/30 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Direct Employer Career Destination
                </span>
              </div>
              <span className="text-[11px] font-mono-url px-2 py-0.5 rounded bg-teal-700/10 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300 font-semibold">
                NO PAYWALL
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#F4F2EC] dark:bg-[#0A0F1A] border border-[#E2DFD5] dark:border-[#23314B]">
              <span className="font-mono-url text-xs sm:text-sm text-teal-900 dark:text-teal-300 break-all">
                {job.directUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#182338] border border-[#DCD9CE] dark:border-[#2A3B5C] text-slate-700 dark:text-slate-200 hover:border-teal-600 shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={job.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (!savedEntry) {
                    onChangeStatus(job, 'applied');
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-teal-700 hover:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 transition-colors shadow-xs"
              >
                <span>Open {job.hostname} Career Page</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </a>

              <button
                type="button"
                onClick={() => onToggleSave(job)}
                className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                  savedEntry
                    ? 'bg-teal-700/12 border-teal-700/35 text-teal-900 dark:bg-teal-400/15 dark:text-teal-300'
                    : 'bg-white dark:bg-[#182338] border-[#DCD9CE] dark:border-[#2A3B5C] text-slate-700 dark:text-slate-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${savedEntry ? 'fill-current' : ''}`} />
                <span>{savedEntry ? 'Saved' : 'Save Role'}</span>
              </button>
            </div>
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#131C2E] border border-[#E5E2DA] dark:border-[#22304A]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Location
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                <span>{job.locationLabel}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#131C2E] border border-[#E5E2DA] dark:border-[#22304A]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Compensation
              </div>
              <div className="mt-1 text-sm font-mono-url font-bold text-slate-900 dark:text-white">
                {job.salaryRange}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#131C2E] border border-[#E5E2DA] dark:border-[#22304A] col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Timezone Window
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>{job.timezoneTag}</span>
              </div>
            </div>
          </div>

          {/* Role Overview */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                About the Role
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                {job.summary}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                What You’ll Do
              </h3>
              <ul className="space-y-2">
                {job.responsibilities.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                What They Look For
              </h3>
              <ul className="space-y-2">
                {job.requirements.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFECE4] dark:bg-[#19243B] text-slate-700 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                {job.employmentType} · {job.experienceLevel}
              </span>
            </div>
          </div>

          {/* Personal Application Tracker Box */}
          <div className="rounded-2xl bg-white dark:bg-[#131C2E] border border-[#E5E2DA] dark:border-[#22304A] p-4 sm:p-5 space-y-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Application Status (Saved in Your Browser)
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = savedEntry?.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeStatus(job, opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-teal-700 text-white border-teal-700 dark:bg-teal-500 dark:text-slate-950 dark:border-teal-500'
                        : 'bg-[#FAF9F6] dark:bg-[#0D1422] text-slate-600 dark:text-slate-300 border-[#DFDCD2] dark:border-[#263552] hover:border-teal-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {savedEntry && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Private Notes (referral contact, salary discussed, resume version)
                </label>
                <textarea
                  rows={2}
                  value={savedEntry.notes}
                  onChange={(e) => onChangeNotes(job.id, e.target.value)}
                  placeholder="Add private notes for this company application..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-[#FAF9F6] dark:bg-[#0D1422] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
