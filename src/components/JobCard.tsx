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
} from 'lucide-react';
import { ApplicationStatus, Job } from '../types';

interface JobCardProps {
  job: Job;
  savedStatus?: ApplicationStatus;
  onToggleSave: (job: Job) => void;
  onSelectJob: (job: Job) => void;
  onMarkApplied: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  savedStatus,
  onToggleSave,
  onSelectJob,
  onMarkApplied,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(job.directUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const isSaved = Boolean(savedStatus);

  return (
    <article
      onClick={() => onSelectJob(job)}
      className="group relative bg-white dark:bg-[#131C2E] rounded-2xl border border-[#E4E1D8] dark:border-[#22304A] hover:border-teal-700/50 dark:hover:border-teal-400/50 p-5 transition-all shadow-2xs hover:shadow-md cursor-pointer"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left: Monogram + Job Info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div
            style={{ backgroundColor: job.companyColor }}
            className="w-11 h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs select-none"
          >
            {job.companyInitials}
          </div>

          <div className="min-w-0 flex-1">
            {/* Top Meta Row */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {job.companyName}
              </span>

              {job.workMode === 'online' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-700/10 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300 border border-sky-700/20 dark:border-sky-400/25">
                  <Laptop className="w-3 h-3" />
                  <span>Online · 100% Remote</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-700/10 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300 border border-amber-700/20 dark:border-amber-400/25">
                  <Building className="w-3 h-3" />
                  <span>Hybrid</span>
                </span>
              )}

              {job.region === 'Worldwide' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-700/10 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300">
                  <Globe2 className="w-3 h-3" />
                  <span>Anywhere</span>
                </span>
              )}

              {job.isLiveAts && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono-url font-semibold uppercase bg-emerald-600 text-white">
                  Live ATS
                </span>
              )}

              {job.isCommunity && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono-url font-semibold uppercase bg-violet-600/15 text-violet-800 dark:text-violet-300">
                  Community Added
                </span>
              )}

              {savedStatus && savedStatus !== 'saved' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono-url font-semibold uppercase bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950">
                  {savedStatus}
                </span>
              )}
            </div>

            {/* Job Title */}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug">
              {job.title}
            </h2>

            {/* Location, Salary, Category, Experience */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {job.locationLabel}
              </span>
              <span className="font-mono-url font-semibold text-slate-800 dark:text-slate-100">
                {job.salaryRange}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#F3F1EB] dark:bg-[#1B2740] text-slate-700 dark:text-slate-300 font-medium">
                {job.category}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {job.experienceLevel}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                {job.postedDaysAgo === 0
                  ? 'Today'
                  : job.postedDaysAgo === 1
                  ? '1d ago'
                  : `${job.postedDaysAgo}d ago`}
              </span>
            </div>

            {/* Concise 1-line summary */}
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {job.summary}
            </p>
          </div>
        </div>

        {/* Right: Save + Direct Apply CTA */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex md:flex-col items-center md:items-end justify-between gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F0EDE5] dark:border-[#1E2B44]"
        >
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleSave(job)}
              title={isSaved ? 'Remove from Tracker' : 'Save to Tracker'}
              aria-label={isSaved ? 'Remove from Tracker' : 'Save to Tracker'}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-teal-700/12 border-teal-700/35 text-teal-800 dark:bg-teal-400/20 dark:border-teal-400/40 dark:text-teal-300'
                  : 'bg-[#FAF9F6] dark:bg-[#0D1422] border-[#E2DFD5] dark:border-[#24324D] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <a
              href={job.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onMarkApplied(job)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-700 hover:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 shadow-2xs transition-colors"
            >
              <span>Company Career URL</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
          </div>

          {/* Transparent Direct URL Monospace Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F2EC] dark:bg-[#0D1422] border border-[#E5E2DA] dark:border-[#23314B] max-w-full">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
            <span
              title={job.directUrl}
              className="text-[11px] font-mono-url text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-[230px]"
            >
              {job.displayUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              title="Copy direct career URL"
              aria-label="Copy direct career URL"
              className="ml-0.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
