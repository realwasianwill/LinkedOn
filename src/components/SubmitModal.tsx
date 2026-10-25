import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DirectoryStats, Job } from '../types';
import { CATEGORIES, EXPERIENCE_LEVELS, REGIONS, TIMEZONE_OPTIONS } from './HeroFilterBar';

interface SubmitModalProps {
  open: boolean;
  onClose: () => void;
  onJobCreated: (job: Job, stats: DirectoryStats) => void;
}

interface UrlValidationResult {
  valid: boolean;
  error?: string;
  hostname?: string;
  displayUrl?: string;
  verificationType?: string;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  open,
  onClose,
  onJobCreated,
}) => {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [workMode, setWorkMode] = useState<'online' | 'hybrid'>('online');
  const [region, setRegion] = useState('Worldwide');
  const [country, setCountry] = useState('Anywhere');
  const [category, setCategory] = useState('Engineering');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [timezoneTag, setTimezoneTag] = useState('Async / Any Timezone');
  const [salaryRange, setSalaryRange] = useState('');
  const [summary, setSummary] = useState('');

  const [urlCheck, setUrlCheck] = useState<UrlValidationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!directUrl.trim()) {
      setUrlCheck(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/validate-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: directUrl }),
        });
        const data = await res.json();
        setUrlCheck(data);
      } catch {
        // ignore transient network check error
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [directUrl]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          companyName,
          directUrl,
          workMode,
          region,
          country,
          category,
          experienceLevel,
          timezoneTag,
          salaryRange: salaryRange || 'Listed on Company Site',
          summary,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Could not publish listing.');
        setSubmitting(false);
        return;
      }

      onJobCreated(data.job, data.stats);
      setTitle('');
      setCompanyName('');
      setDirectUrl('');
      setSalaryRange('');
      setSummary('');
      setUrlCheck(null);
      setSubmitting(false);
      onClose();
    } catch {
      setSubmitError('Network error while saving job. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#FAF9F6] dark:bg-[#0E1525] rounded-2xl border border-[#E2DFD5] dark:border-[#22304A] shadow-2xl overflow-hidden my-8"
      >
        <div className="px-6 py-4 border-b border-[#E5E2DA] dark:border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Post a Direct Company Career URL
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Help job seekers skip middleman paywalls. Paste an official employer career link — LinkedOn automatically blocks paywalled boards (FlexJobs, JobLeads, Lensa) and third-party aggregators.
          </p>

          {/* Direct URL Field + Live Anti-Paywall Feedback */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Official Company Career URL *
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDirectUrl('https://www.flexjobs.com/remote-jobs/test')}
                  className="text-rose-700 dark:text-rose-400 underline cursor-pointer"
                >
                  Test Paywall Block
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setDirectUrl('https://linear.app/careers')}
                  className="text-teal-700 dark:text-teal-400 underline cursor-pointer"
                >
                  Test Direct URL
                </button>
              </div>
            </div>
            <input
              type="text"
              required
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://company.com/careers or https://jobs.lever.co/company/..."
              className="w-full px-3.5 py-2.5 rounded-xl font-mono-url text-xs sm:text-sm bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/35"
            />

            {urlCheck && (
              <div
                className={`mt-2 p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
                  urlCheck.valid
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600/30 text-emerald-900 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/35 border-rose-600/30 text-rose-900 dark:text-rose-300'
                }`}
              >
                {urlCheck.valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Verified {urlCheck.verificationType}:</strong>{' '}
                      <span className="font-mono-url">{urlCheck.displayUrl}</span> — zero middleman paywalls detected.
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>{urlCheck.error}</div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Product Designer (Remote)"
                className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Linear"
                className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Work Mode *
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as 'online' | 'hybrid')}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
              >
                <option value="online">Online (100% Remote)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Global Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
              >
                {REGIONS.filter((r) => r !== 'all').map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Country / Hub
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Anywhere / Indonesia / UK"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Department
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
              >
                {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Experience
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
              >
                {EXPERIENCE_LEVELS.filter((x) => x !== 'all').map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Salary Range (Optional)
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="$70k – $100k USD"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Timezone Expectation
            </label>
            <select
              value={timezoneTag}
              onChange={(e) => setTimezoneTag(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
            >
              {TIMEZONE_OPTIONS.filter((t) => t !== 'all').map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Short Summary (Optional)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Briefly describe the online/hybrid setup and what the team builds..."
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white"
            />
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/35 border border-rose-600/30 text-xs text-rose-800 dark:text-rose-300">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (urlCheck !== null && !urlCheck.valid)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-700 hover:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? 'Verifying & Publishing...' : 'Publish Direct Career Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
