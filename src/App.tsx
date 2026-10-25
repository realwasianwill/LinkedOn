import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  FilterX,
  ShieldCheck,
} from 'lucide-react';
import {
  ApplicationStatus,
  Company,
  DirectoryStats,
  Job,
  SavedJobEntry,
} from './types';
import { ActiveTab, Navbar } from './components/Navbar';
import { HeroFilterBar } from './components/HeroFilterBar';
import { JobCard } from './components/JobCard';
import { JobDetailDrawer } from './components/JobDetailDrawer';
import { CompanyDirectory } from './components/CompanyDirectory';
import { SavedTracker } from './components/SavedTracker';
import { SubmitModal } from './components/SubmitModal';
import { PaywallShieldModal } from './components/PaywallShieldModal';
import {
  loadInitialTheme,
  loadSavedJobs,
  saveThemePreference,
  toggleSaveJob,
  updateJobNotes,
  upsertJobStatus,
} from './utils/storage';
import { fetchLiveCompanyAtsJobs } from './utils/liveAtsSync';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [theme, setTheme] = useState<'light' | 'dark'>(loadInitialTheme);

  const [baseJobs, setBaseJobs] = useState<Job[]>([]);
  const [liveAtsJobs, setLiveAtsJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<DirectoryStats>({
    totalJobs: 48,
    onlineJobs: 32,
    hybridJobs: 16,
    worldwideJobs: 15,
    totalCompanies: 44,
    zeroPaywallGuarantee: true,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState<
    'all' | 'online' | 'hybrid' | 'worldwide'
  >('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [timezoneFilter, setTimezoneFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'company' | 'title'>('recent');

  // Interactive drawers & modals
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [shieldModalOpen, setShieldModalOpen] = useState(false);

  // Saved tracker state
  const [savedMap, setSavedMap] = useState<Record<string, SavedJobEntry>>(loadSavedJobs);

  // Live ATS sync status
  const [liveSyncState, setLiveSyncState] = useState<{
    loading: boolean;
    syncedCount: number;
    companies: string[];
    attempted: boolean;
  }>({
    loading: false,
    syncedCount: 0,
    companies: [],
    attempted: false,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    async function loadInitialData() {
      try {
        const [jobsRes, compRes, statsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/companies'),
          fetch('/api/stats'),
        ]);
        const [jobsData, compData, statsData] = await Promise.all([
          jobsRes.json(),
          compRes.json(),
          statsRes.json(),
        ]);
        if (!mounted) return;
        if (Array.isArray(jobsData.jobs)) setBaseJobs(jobsData.jobs);
        if (Array.isArray(compData.companies)) setCompanies(compData.companies);
        if (statsData && typeof statsData.totalJobs === 'number') setStats(statsData);
      } catch (err) {
        console.error('Failed loading LinkedOn API:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadInitialData();
    return () => {
      mounted = false;
    };
  }, []);

  const combinedJobs = useMemo(() => {
    return [...liveAtsJobs, ...baseJobs];
  }, [liveAtsJobs, baseJobs]);

  const effectiveStats = useMemo<DirectoryStats>(() => {
    const onlineCount = combinedJobs.filter((j) => j.workMode === 'online').length;
    const hybridCount = combinedJobs.filter((j) => j.workMode === 'hybrid').length;
    const worldwideCount = combinedJobs.filter((j) => j.region === 'Worldwide').length;
    return {
      totalJobs: combinedJobs.length || stats.totalJobs,
      onlineJobs: onlineCount || stats.onlineJobs,
      hybridJobs: hybridCount || stats.hybridJobs,
      worldwideJobs: worldwideCount || stats.worldwideJobs,
      totalCompanies: companies.length || stats.totalCompanies,
      zeroPaywallGuarantee: true,
    };
  }, [combinedJobs, companies, stats]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = combinedJobs.filter((job) => {
      if (workModeFilter === 'online' && job.workMode !== 'online') return false;
      if (workModeFilter === 'hybrid' && job.workMode !== 'hybrid') return false;
      if (
        workModeFilter === 'worldwide' &&
        !(job.workMode === 'online' && job.region === 'Worldwide')
      ) {
        return false;
      }

      if (regionFilter !== 'all') {
        if (regionFilter === 'Worldwide') {
          if (job.region !== 'Worldwide') return false;
        } else {
          // Show roles in the selected region + Worldwide Work-from-Anywhere roles (unless Hybrid filter is strictly chosen and role isn't in region)
          const matchesSelected = job.region === regionFilter;
          const matchesAnywhere = job.region === 'Worldwide';
          if (!matchesSelected && !matchesAnywhere) return false;
        }
      }

      if (categoryFilter !== 'all' && job.category !== categoryFilter) {
        return false;
      }

      if (experienceFilter !== 'all' && job.experienceLevel !== experienceFilter) {
        return false;
      }

      if (
        timezoneFilter !== 'all' &&
        job.timezoneTag !== timezoneFilter &&
        job.timezoneTag !== 'Async / Any Timezone'
      ) {
        return false;
      }

      if (q) {
        const haystack = [
          job.title,
          job.companyName,
          job.locationLabel,
          job.country,
          job.region,
          job.category,
          job.experienceLevel,
          job.hostname,
          job.displayUrl,
          job.summary,
          job.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...filtered];
    if (sortBy === 'company') {
      sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        if (Boolean(b.isCommunity) !== Boolean(a.isCommunity)) {
          return b.isCommunity ? 1 : -1;
        }
        return a.postedDaysAgo - b.postedDaysAgo;
      });
    }
    return sorted;
  }, [
    combinedJobs,
    searchQuery,
    workModeFilter,
    regionFilter,
    categoryFilter,
    experienceFilter,
    timezoneFilter,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setWorkModeFilter('all');
    setRegionFilter('all');
    setCategoryFilter('all');
    setExperienceFilter('all');
    setTimezoneFilter('all');
  };

  const handleSyncLiveAts = async () => {
    setLiveSyncState((prev) => ({ ...prev, loading: true }));
    try {
      const { jobs, syncedCompanies } = await fetchLiveCompanyAtsJobs();
      setLiveAtsJobs(jobs);
      setLiveSyncState({
        loading: false,
        syncedCount: jobs.length,
        companies: syncedCompanies,
        attempted: true,
      });
    } catch {
      setLiveSyncState({
        loading: false,
        syncedCount: 0,
        companies: [],
        attempted: true,
      });
    }
  };

  const handleToggleSave = (job: Job) => {
    setSavedMap((prev) => toggleSaveJob(prev, job));
  };

  const handleChangeStatus = (job: Job, status: ApplicationStatus) => {
    setSavedMap((prev) => upsertJobStatus(prev, job, status));
  };

  const handleMarkAppliedOnOpen = (job: Job) => {
    setSavedMap((prev) => {
      if (prev[job.id]) return prev;
      return upsertJobStatus(prev, job, 'applied');
    });
  };

  const handleChangeNotes = (jobId: string, notes: string) => {
    setSavedMap((prev) => updateJobNotes(prev, jobId, notes));
  };

  const handleJobCreated = (newJob: Job, newStats: DirectoryStats) => {
    setBaseJobs((prev) => [newJob, ...prev]);
    setStats(newStats);
    setActiveTab('jobs');
    handleResetFilters();
  };

  const handleFilterJobsByCompany = (companyName: string) => {
    handleResetFilters();
    setSearchQuery(companyName);
    setActiveTab('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#0B101B] text-slate-900 dark:text-slate-100">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={Object.keys(savedMap).length}
        totalCompanies={effectiveStats.totalCompanies}
        totalJobs={effectiveStats.totalJobs}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenSubmit={() => setSubmitModalOpen(true)}
        onOpenShield={() => setShieldModalOpen(true)}
      />

      {activeTab === 'jobs' && (
        <HeroFilterBar
          stats={effectiveStats}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          workModeFilter={workModeFilter}
          onWorkModeChange={setWorkModeFilter}
          regionFilter={regionFilter}
          onRegionChange={setRegionFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          experienceFilter={experienceFilter}
          onExperienceChange={setExperienceFilter}
          timezoneFilter={timezoneFilter}
          onTimezoneChange={setTimezoneFilter}
          onResetFilters={handleResetFilters}
          liveSyncState={liveSyncState}
          onSyncLiveAts={handleSyncLiveAts}
          onOpenShield={() => setShieldModalOpen(true)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Result Count & Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing{' '}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {filteredJobs.length}
                </strong>{' '}
                verified direct-career{' '}
                {filteredJobs.length === 1 ? 'opening' : 'openings'}
                {regionFilter !== 'all' && regionFilter !== 'Worldwide' && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                    (includes Worldwide Work-from-Anywhere roles)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-jobs"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                >
                  Sort:
                </label>
                <select
                  id="sort-jobs"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'recent' | 'company' | 'title')
                  }
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#131C2E] border border-[#E2DFD5] dark:border-[#22304A] text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="recent">Newest First</option>
                  <option value="company">Company (A–Z)</option>
                  <option value="title">Role Title (A–Z)</option>
                </select>
              </div>
            </div>

            {liveSyncState.attempted && liveSyncState.syncedCount === 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-300">
                Showing {baseJobs.length} verified direct-employer roles from LinkedOn’s built-in global database (external ATS feed unavailable from current network).
              </div>
            )}

            {/* Job Feed */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-36 rounded-2xl bg-white dark:bg-[#131C2E] border border-[#E4E1D8] dark:border-[#22304A] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-[#131C2E] rounded-2xl border border-[#E4E1D8] dark:border-[#22304A] p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1B2740] text-slate-500 flex items-center justify-center mx-auto">
                  <FilterX className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  No direct-URL roles match that exact filter combination
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Try broadening your department or timezone filter — or jump straight into our {effectiveStats.totalCompanies} verified global company career portals to see every live opening on their site.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('companies')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#DCD9CE] dark:border-[#2A3B5C] text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Browse {effectiveStats.totalCompanies} Direct Portals</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    savedStatus={savedMap[job.id]?.status}
                    onToggleSave={handleToggleSave}
                    onSelectJob={setSelectedJob}
                    onMarkApplied={handleMarkAppliedOnOpen}
                  />
                ))}
              </div>
            )}

            {/* Direct Company Portal Callout Banner */}
            <div className="mt-8 rounded-2xl bg-slate-900 dark:bg-[#131C2E] text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 dark:border-[#243554]">
              <div className="space-y-1 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono-url text-teal-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SKIP THE MIDDLEMAN</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold">
                  Want to search hundreds more openings directly on employer sites?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Explore our directory of {effectiveStats.totalCompanies} verified global companies (GitLab, Wise, GoTo, Grab, Canva, Deel, Nubank, Spotify &amp; more) with 1-click links straight to their official career URLs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('companies');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shrink-0 transition-colors cursor-pointer"
              >
                <span>Explore {effectiveStats.totalCompanies} Company Portals</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <CompanyDirectory
            companies={companies}
            allJobs={combinedJobs}
            onFilterJobsByCompany={handleFilterJobsByCompany}
          />
        )}

        {activeTab === 'saved' && (
          <SavedTracker
            savedMap={savedMap}
            onSelectJob={setSelectedJob}
            onRemoveJob={handleToggleSave}
            onChangeStatus={handleChangeStatus}
            onChangeNotes={handleChangeNotes}
            onBrowseJobs={() => setActiveTab('jobs')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E2DA] dark:border-[#1E293B] bg-white dark:bg-[#0D1321] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
              <span>LinkedOn</span>
              <span className="text-xs font-mono-url font-semibold px-2 py-0.5 rounded bg-teal-700/10 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300">
                $0 Forever
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Find Online &amp; Hybrid jobs from all over the world without paying a single dime. Every link takes you straight to the official company career URL.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => {
                setActiveTab('jobs');
                handleResetFilters();
                setWorkModeFilter('online');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
            >
              100% Online Jobs
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('jobs');
                handleResetFilters();
                setWorkModeFilter('hybrid');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
            >
              Global Hybrid Jobs
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('jobs');
                handleResetFilters();
                setExperienceFilter('Entry-Level');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
            >
              Entry-Level Friendly
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveTab('companies')}
              className="hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
            >
              Direct Company Portals
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShieldModalOpen(true)}
              className="text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Anti-Paywall URL Inspector
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <JobDetailDrawer
        job={selectedJob}
        savedEntry={selectedJob ? savedMap[selectedJob.id] : undefined}
        onClose={() => setSelectedJob(null)}
        onToggleSave={handleToggleSave}
        onChangeStatus={handleChangeStatus}
        onChangeNotes={handleChangeNotes}
      />

      <SubmitModal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onJobCreated={handleJobCreated}
      />

      <PaywallShieldModal
        open={shieldModalOpen}
        onClose={() => setShieldModalOpen(false)}
      />
    </div>
  );
};

export default App;
