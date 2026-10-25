import React from 'react';
import {
  Building,
  Globe2,
  Laptop,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { DirectoryStats } from '../types';

export const REGIONS = [
  'all',
  'Worldwide',
  'Asia-Pacific',
  'Europe',
  'North America',
  'Latin America',
  'Middle East & Africa',
] as const;

export const CATEGORIES = [
  'all',
  'Engineering',
  'Customer Support',
  'Design & Creative',
  'Marketing & Content',
  'Product',
  'Data & AI',
  'Finance & Legal',
  'Operations & HR',
  'Sales & Growth',
  'Education & Healthcare',
] as const;

export const EXPERIENCE_LEVELS = [
  'all',
  'Entry-Level',
  'Mid-Level',
  'Senior',
  'Lead',
] as const;

export const TIMEZONE_OPTIONS = [
  'all',
  'Async / Any Timezone',
  'APAC Friendly (UTC+5 to UTC+11)',
  'EMEA Friendly (UTC-1 to UTC+4)',
  'Americas Friendly (UTC-8 to UTC-3)',
] as const;

interface HeroFilterBarProps {
  stats: DirectoryStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  workModeFilter: 'all' | 'online' | 'hybrid' | 'worldwide';
  onWorkModeChange: (mode: 'all' | 'online' | 'hybrid' | 'worldwide') => void;
  regionFilter: string;
  onRegionChange: (region: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  experienceFilter: string;
  onExperienceChange: (exp: string) => void;
  timezoneFilter: string;
  onTimezoneChange: (tz: string) => void;
  onResetFilters: () => void;
  liveSyncState: {
    loading: boolean;
    syncedCount: number;
    companies: string[];
    attempted: boolean;
  };
  onSyncLiveAts: () => void;
  onOpenShield: () => void;
}

export const HeroFilterBar: React.FC<HeroFilterBarProps> = ({
  stats,
  searchQuery,
  onSearchChange,
  workModeFilter,
  onWorkModeChange,
  regionFilter,
  onRegionChange,
  categoryFilter,
  onCategoryChange,
  experienceFilter,
  onExperienceChange,
  timezoneFilter,
  onTimezoneChange,
  onResetFilters,
  liveSyncState,
  onSyncLiveAts,
  onOpenShield,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    workModeFilter !== 'all' ||
    regionFilter !== 'all' ||
    categoryFilter !== 'all' ||
    experienceFilter !== 'all' ||
    timezoneFilter !== 'all';

  return (
    <section className="editorial-grid border-b border-[#E5E2DA] dark:border-[#1E293B] bg-[#FAF9F6] dark:bg-[#0B101B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-7">
        {/* Editorial Top Tagline + Stats */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
          <div className="max-w-3xl">
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-teal-700/10 dark:bg-teal-400/12 border border-teal-700/20 dark:border-teal-400/25 text-teal-900 dark:text-teal-300 text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>100% Free · Zero Paywalls · Direct to Employer Career URLs</span>
              <button
                type="button"
                onClick={onOpenShield}
                className="underline decoration-teal-700/50 hover:decoration-teal-700 ml-1 cursor-pointer"
              >
                Verify a link
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Online &amp; Hybrid jobs worldwide.{' '}
              <span className="text-teal-700 dark:text-teal-400">
                Straight to the company’s site.
              </span>
            </h1>

            <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Skip subscription traps like FlexJobs and middleman redirect boards. Browse
              verified <strong className="font-semibold text-slate-900 dark:text-white">100% Online</strong> and{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">Hybrid</strong> openings across 6 continents — every button shows the exact employer domain before you click.
            </p>
          </div>

          {/* Compact Live Ledger */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0 bg-white dark:bg-[#131C2E] p-3.5 rounded-xl border border-[#E4E1D8] dark:border-[#22304A] shadow-2xs">
            <div className="px-2">
              <div className="text-xl sm:text-2xl font-extrabold font-mono-url text-slate-900 dark:text-white">
                {stats.onlineJobs}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Online Roles
              </div>
            </div>
            <div className="px-2 border-x border-[#E8E5DC] dark:border-[#22304A]">
              <div className="text-xl sm:text-2xl font-extrabold font-mono-url text-amber-700 dark:text-amber-400">
                {stats.hybridJobs}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Hybrid Roles
              </div>
            </div>
            <div className="px-2">
              <div className="text-xl sm:text-2xl font-extrabold font-mono-url text-teal-700 dark:text-teal-400">
                $0
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Fees Ever
              </div>
            </div>
          </div>
        </div>

        {/* Main Filter Surface */}
        <div className="bg-white dark:bg-[#131C2E] rounded-2xl border border-[#E2DFD5] dark:border-[#22304A] p-4 sm:p-5 shadow-xs space-y-4">
          {/* Row 1: Search Input + Segmented Work Mode */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder='Search title, company, country, or career domain (e.g. "Support", "Jakarta", "Entry-Level", "wise.jobs")'
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#0D1422] border border-[#DFDCD2] dark:border-[#263552] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/40 focus:border-teal-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Segmented Work Mode Switch */}
            <div
              role="group"
              aria-label="Filter by work mode"
              className="grid grid-cols-2 sm:flex items-center bg-[#F3F1EB] dark:bg-[#0D1422] p-1 rounded-xl border border-[#E2DFD5] dark:border-[#23314B] gap-1"
            >
              <button
                type="button"
                onClick={() => onWorkModeChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  workModeFilter === 'all'
                    ? 'bg-white dark:bg-[#1E2B45] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Modes
              </button>
              <button
                type="button"
                onClick={() => onWorkModeChange('online')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  workModeFilter === 'online'
                    ? 'bg-sky-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Online</span>
              </button>
              <button
                type="button"
                onClick={() => onWorkModeChange('hybrid')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  workModeFilter === 'hybrid'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Hybrid</span>
              </button>
              <button
                type="button"
                onClick={() => onWorkModeChange('worldwide')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  workModeFilter === 'worldwide'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Anywhere</span>
              </button>
            </div>
          </div>

          {/* Row 2: Global Region Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0">
              Region:
            </span>
            {REGIONS.map((reg) => {
              const active = regionFilter === reg;
              const label =
                reg === 'all'
                  ? 'All Regions'
                  : reg === 'Worldwide'
                  ? '🌍 Worldwide (Anywhere)'
                  : reg;
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => onRegionChange(reg)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 dark:bg-teal-500 text-white dark:text-slate-950 border-slate-900 dark:border-teal-500'
                      : 'bg-[#FAF9F6] dark:bg-[#0D1422] text-slate-600 dark:text-slate-300 border-[#E2DFD5] dark:border-[#24324D] hover:border-slate-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Row 3: Discipline, Experience, Timezone & Live Official ATS Sync */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#F0EDE5] dark:border-[#1E2B44]">
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF9F6] dark:bg-[#0D1422] border border-[#DFDCD2] dark:border-[#263552] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Departments' : c}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by experience level"
                value={experienceFilter}
                onChange={(e) => onExperienceChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF9F6] dark:bg-[#0D1422] border border-[#DFDCD2] dark:border-[#263552] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30 cursor-pointer"
              >
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp === 'all' ? 'Any Experience Level' : exp}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by timezone compatibility"
                value={timezoneFilter}
                onChange={(e) => onTimezoneChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF9F6] dark:bg-[#0D1422] border border-[#DFDCD2] dark:border-[#263552] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30 cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz === 'all' ? 'Any Timezone' : tz}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            {/* Live Direct ATS Feed Button */}
            <button
              type="button"
              onClick={onSyncLiveAts}
              disabled={liveSyncState.loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-teal-700/30 dark:border-teal-400/30 bg-teal-700/8 dark:bg-teal-400/10 text-teal-800 dark:text-teal-300 hover:bg-teal-700/15 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {liveSyncState.loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              )}
              <span>
                {liveSyncState.loading
                  ? 'Syncing Official Company ATS...'
                  : liveSyncState.syncedCount > 0
                  ? `✓ +${liveSyncState.syncedCount} Live ATS Roles (${liveSyncState.companies.length} Employers)`
                  : 'Sync Live Official ATS Feeds'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
