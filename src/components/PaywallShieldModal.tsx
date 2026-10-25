import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BlockedDomainInfo } from '../types';

interface PaywallShieldModalProps {
  open: boolean;
  onClose: () => void;
}

export const PaywallShieldModal: React.FC<PaywallShieldModalProps> = ({
  open,
  onClose,
}) => {
  const [testUrl, setTestUrl] = useState('');
  const [checkResult, setCheckResult] = useState<{
    valid: boolean;
    error?: string;
    displayUrl?: string;
    verificationType?: string;
  } | null>(null);
  const [blockedDomains, setBlockedDomains] = useState<BlockedDomainInfo[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch('/api/blocked-domains')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.domains)) setBlockedDomains(d.domains);
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!testUrl.trim()) {
      setCheckResult(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/validate-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: testUrl }),
        });
        const data = await res.json();
        setCheckResult(data);
      } catch {
        // ignore
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [testUrl]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#FAF9F6] dark:bg-[#0E1525] rounded-2xl border border-[#E2DFD5] dark:border-[#22304A] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-[#E5E2DA] dark:border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">
              LinkedOn Anti-Paywall &amp; Direct-URL Shield
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

        <div className="p-6 overflow-y-auto space-y-5">
          <div className="rounded-xl bg-teal-700/8 dark:bg-teal-400/10 border border-teal-700/20 dark:border-teal-400/20 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <strong>Our Zero-Dime Standard:</strong> Real employers never charge candidates to view or apply for a job. LinkedOn rejects subscription sites, email-gated aggregators, and opaque URL shorteners — routing you straight to official company career portals (e.g.{' '}
            <code className="font-mono-url text-teal-800 dark:text-teal-300">wise.jobs</code>,{' '}
            <code className="font-mono-url text-teal-800 dark:text-teal-300">gotocompany.com/en/careers</code>,{' '}
            <code className="font-mono-url text-teal-800 dark:text-teal-300">about.gitlab.com/jobs</code>).
          </div>

          {/* Interactive URL Scanner */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Instant Job Link Inspector — Paste Any URL to Check If It’s Direct or a Middleman
            </label>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Paste any URL (try https://flexjobs.com/jobs or https://stripe.com/jobs)..."
              className="w-full px-3.5 py-2.5 rounded-xl font-mono-url text-xs sm:text-sm bg-white dark:bg-[#131C2E] border border-[#DFDCD2] dark:border-[#263552] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/35"
            />
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="text-slate-400">Try examples:</span>
              <button
                type="button"
                onClick={() => setTestUrl('https://www.flexjobs.com/search')}
                className="text-rose-700 dark:text-rose-400 underline cursor-pointer"
              >
                flexjobs.com
              </button>
              <button
                type="button"
                onClick={() => setTestUrl('https://www.jobleads.com/jobs')}
                className="text-rose-700 dark:text-rose-400 underline cursor-pointer"
              >
                jobleads.com
              </button>
              <button
                type="button"
                onClick={() => setTestUrl('https://www.gotocompany.com/en/careers')}
                className="text-teal-700 dark:text-teal-400 underline cursor-pointer"
              >
                gotocompany.com/en/careers
              </button>
              <button
                type="button"
                onClick={() => setTestUrl('https://wise.jobs/')}
                className="text-teal-700 dark:text-teal-400 underline cursor-pointer"
              >
                wise.jobs
              </button>
            </div>

            {checkResult && (
              <div
                className={`p-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 border ${
                  checkResult.valid
                    ? 'bg-emerald-50 dark:bg-emerald-950/35 border-emerald-600/30 text-emerald-900 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/35 border-rose-600/30 text-rose-900 dark:text-rose-300'
                }`}
              >
                {checkResult.valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Safe &amp; Direct ({checkResult.verificationType}):</strong>{' '}
                      <span className="font-mono-url">{checkResult.displayUrl}</span> goes straight to the employer without middleman fees.
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>{checkResult.error}</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Blocked Paywall & Aggregator Domains List */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Actively Blocked Paywalls, Aggregators &amp; Shorteners ({blockedDomains.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {blockedDomains.map((item) => (
                <div
                  key={item.domain}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#131C2E] border border-[#E5E2DA] dark:border-[#22304A] text-xs"
                >
                  <div className="font-mono-url font-bold text-rose-700 dark:text-rose-400">
                    ✕ {item.domain}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
