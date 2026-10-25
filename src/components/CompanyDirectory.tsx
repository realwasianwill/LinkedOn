import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  Check,
  Copy,
  Globe2,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Company, Job } from '../types';
import { REGIONS } from './HeroFilterBar';

interface CompanyDirectoryProps {
  companies: Company[];
  allJobs: Job[];
  onFilterJobsByCompany: (companyName: string) => void;
}

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({
  companies,
  allJobs,
  onFilterJobsByCompany,
}) => {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [policy, setPolicy] = useState<'all' | 'online' | 'hybrid'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const jobCountsByCompany = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const j of allJobs) {
      counts[j.companyName.toLowerCase()] = (counts[j.companyName.toLowerCase()] || 0) + 1;
    }
    return counts;
  }, [allJobs]);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (region !== 'all') {
        if (!c.regions.includes(region) && !c.regions.includes('Worldwide')) {
          return false;
        }
      }
      if (policy === 'online' && !c.workPolicy.toLowerCase().includes('online')) {
        return false;
      }
      if (policy === 'hybrid' && !c.workPolicy.toLowerCase().includes('hybrid')) {
        return false;
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${c.name} ${c.tagline} ${c.hq} ${c.category} ${c.hostname} ${c.regions.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [companies, region, policy, query]);

  const handleCopy = async (company: Company) => {
    try {
      await navigator.clipboard.writeText(company.careerUrl);
      setCopiedId(company.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Filter Controls */}
      <div className="bg-white dark:bg-[#131C2E] rounded-2xl border border-[#E4E1D8] dark:border-[#22304A] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Verified Direct Career Portals</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Jump Straight Into Official Company Career Pages
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Every link below opens the employer’s official hiring portal where hundreds of rolling Online and Hybrid roles are posted first — before aggregators scrape or paywall them.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold font-mono-url text-teal-700 dark:text-teal-400">
              {filtered.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Verified Employers
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search company, city, industry, or domain (e.g. "GoTo", "Singapore", "Fintech", "wise.jobs")'
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#0D1422] border border-[#DFDCD2] dark:border-[#263552] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/35"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F3F1EB] dark:bg-[#0D1422] p-1 rounded-xl border border-[#E2DFD5] dark:border-[#23314B]">
            {(['all', 'online', 'hybrid'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPolicy(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  policy === p
                    ? 'bg-white dark:bg-[#1E2B45] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {p === 'all' ? 'All Policies' : p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {REGIONS.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setRegion(reg)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                region === reg
                  ? 'bg-slate-900 dark:bg-teal-500 text-white dark:text-slate-950 border-slate-900 dark:border-teal-500'
                  : 'bg-[#FAF9F6] dark:bg-[#0D1422] text-slate-600 dark:text-slate-300 border-[#E2DFD5] dark:border-[#24324D]'
              }`}
            >
              {reg === 'all' ? 'All Regions' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => {
          const roleCount = jobCountsByCompany[company.name.toLowerCase()] || 0;
          return (
            <article
              key={company.id}
              className="bg-white dark:bg-[#131C2E] rounded-2xl border border-[#E4E1D8] dark:border-[#22304A] hover:border-teal-700/50 dark:hover:border-teal-400/50 p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: company.logoBg }}
                      className="w-11 h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0"
                    >
                      {company.initials}
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {company.name}
                      </h2>
                      <span className="inline-block mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-700/10 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300">
                        {company.workPolicy}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono-url">
                    <Users className="w-3 h-3" />
                    {company.employeeCount}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {company.tagline}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{company.hq}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="truncate">{company.regions.join(' · ')}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {company.highlights.map((h) => (
                    <span
                      key={h}
                      className="px-2 py-0.5 rounded text-[11px] bg-[#F3F1EB] dark:bg-[#19243B] text-slate-700 dark:text-slate-300"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EDE5] dark:border-[#1E2B44] space-y-2.5">
                {/* Direct URL Monospace Row */}
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#F4F2EC] dark:bg-[#0D1422] border border-[#E5E2DA] dark:border-[#23314B]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                    <span
                      title={company.careerUrl}
                      className="text-[11px] font-mono-url text-slate-700 dark:text-slate-300 truncate"
                    >
                      {company.displayUrl}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(company)}
                    aria-label={`Copy ${company.name} career URL`}
                    className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                  >
                    {copiedId === company.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {roleCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onFilterJobsByCompany(company.name)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#EFECE4] hover:bg-[#E5E1D6] dark:bg-[#1A263E] dark:hover:bg-[#223150] text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      {roleCount} Listed {roleCount === 1 ? 'Role' : 'Roles'}
                    </button>
                  )}

                  <a
                    href={company.careerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 transition-colors"
                  >
                    <span>Open Career Portal</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
