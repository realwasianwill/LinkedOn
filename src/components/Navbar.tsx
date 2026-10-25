import React from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Building2,
  Briefcase,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
} from 'lucide-react';

export type ActiveTab = 'jobs' | 'companies' | 'saved';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
  totalCompanies: number;
  totalJobs: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSubmit: () => void;
  onOpenShield: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  totalCompanies,
  totalJobs,
  theme,
  onToggleTheme,
  onOpenSubmit,
  onOpenShield,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E2DA] dark:border-[#1E293B] bg-[#FAF9F6]/92 dark:bg-[#0B101B]/92 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onSelectTab('jobs')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-700 dark:bg-teal-600 text-[#FAF9F6] flex items-center justify-center shadow-xs group-hover:bg-teal-800 transition-colors">
              <ArrowUpRight className="w-5 h-5 stroke-[2.6]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  LinkedOn
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-url font-semibold uppercase tracking-wider bg-teal-700/10 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300">
                  Direct
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight hidden sm:block">
                Zero paywalls · Direct career URLs
              </p>
            </div>
          </button>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#EFECE4] dark:bg-[#131C2E] p-1 rounded-lg border border-[#E2DFD5] dark:border-[#22304A]">
            <button
              type="button"
              onClick={() => onSelectTab('jobs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-white dark:bg-[#1E2B45] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Open Roles</span>
              <span className="text-xs font-mono-url text-slate-500 dark:text-slate-400">
                {totalJobs}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('companies')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'companies'
                  ? 'bg-white dark:bg-[#1E2B45] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Company Portals</span>
              <span className="text-xs font-mono-url text-slate-500 dark:text-slate-400">
                {totalCompanies}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-white dark:bg-[#1E2B45] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Tracker</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-xs font-mono-url font-semibold bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenShield}
            title="Verify URLs & see how LinkedOn blocks paywalled job boards"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-teal-700/25 dark:border-teal-400/25 bg-teal-700/8 dark:bg-teal-400/10 text-teal-800 dark:text-teal-300 hover:bg-teal-700/15 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>$0 Paywall Shield</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg border border-[#E2DFD5] dark:border-[#23314B] bg-white dark:bg-[#131C2E] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1B2740] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenSubmit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Post Direct URL</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom-of-Header Tab Strip */}
      <div className="flex md:hidden border-t border-[#E5E2DA] dark:border-[#1E293B] bg-[#F5F3EE] dark:bg-[#0F1626] px-2 py-1.5 gap-1">
        <button
          type="button"
          onClick={() => onSelectTab('jobs')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-white dark:bg-[#1E2B45] text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Roles ({totalJobs})</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('companies')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
            activeTab === 'companies'
              ? 'bg-white dark:bg-[#1E2B45] text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Portals ({totalCompanies})</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('saved')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-white dark:bg-[#1E2B45] text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Tracker ({savedCount})</span>
        </button>
        <button
          type="button"
          onClick={onOpenShield}
          className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-700/10 cursor-pointer"
        >
          Shield
        </button>
      </div>
    </header>
  );
};
