// Anti-Paywall & Anti-Aggregator URL Guard for LinkedOn
// Ensures every job & company link goes straight to an official company career page or official company ATS.

export const BLOCKED_PAYWALL_AND_AGGREGATOR_DOMAINS = [
  // Subscription / Paywalled / Paid-tier remote & executive boards
  { domain: 'flexjobs.com', reason: 'Subscription paywall job board ($2.95–$59.95 fee required to view employer links).' },
  { domain: 'jobleads.com', reason: 'Paywalled membership job aggregator.' },
  { domain: 'lensa.com', reason: 'Email-gated middleman job aggregator with sponsored redirects.' },
  { domain: 'virtualvocations.com', reason: 'Subscription-gated remote job board.' },
  { domain: 'theladders.com', reason: 'Paywalled membership job board.' },
  { domain: 'ivyexec.com', reason: 'Membership-gated job aggregator.' },
  { domain: 'execunet.com', reason: 'Paid executive membership job board.' },
  { domain: 'sonara.ai', reason: 'Paid automated job middleman service.' },
  { domain: 'lazyapply.com', reason: 'Paid middleman tool, not an employer career page.' },

  // Generic middleman job aggregators & redirect networks
  { domain: 'indeed.com', reason: 'Generic third-party job aggregator, not a direct company career page.' },
  { domain: 'linkedin.com', reason: 'Third-party social/job platform requiring login & Easy Apply middleman.' },
  { domain: 'glassdoor.com', reason: 'Account-walled third-party review & job aggregator.' },
  { domain: 'ziprecruiter.com', reason: 'Generic job aggregator with redirect tracking.' },
  { domain: 'monster.com', reason: 'Generic third-party job board.' },
  { domain: 'simplyhired.com', reason: 'Third-party job aggregator owned by Recruit Holdings.' },
  { domain: 'careerbuilder.com', reason: 'Generic third-party job board.' },
  { domain: 'snagajob.com', reason: 'Generic job marketplace.' },
  { domain: 'jooble.org', reason: 'Third-party job scraper & redirect aggregator.' },
  { domain: 'jooble.com', reason: 'Third-party job scraper & redirect aggregator.' },
  { domain: 'talent.com', reason: 'Third-party CPC job aggregator.' },
  { domain: 'adzuna.com', reason: 'Third-party job search aggregator.' },
  { domain: 'neuvoo.com', reason: 'Third-party job aggregator.' },
  { domain: 'recruit.net', reason: 'Third-party job aggregator.' },
  { domain: 'dice.com', reason: 'Third-party tech job board.' },
  { domain: 'builtin.com', reason: 'Third-party aggregator directory.' },
  { domain: 'wellfound.com', reason: 'Login-walled startup job aggregator.' },
  { domain: 'angel.co', reason: 'Login-walled startup job aggregator.' },
  { domain: 'weworkremotely.com', reason: 'Third-party remote job board, not an official company career site.' },
  { domain: 'remoteok.com', reason: 'Third-party remote job aggregator.' },
  { domain: 'remotive.com', reason: 'Third-party remote job board with paid community tier.' },
  { domain: 'workingnomads.com', reason: 'Third-party job newsletter/aggregator.' },
  { domain: 'dynamitejobs.com', reason: 'Third-party remote job board.' },
  { domain: 'himalayas.app', reason: 'Third-party remote job aggregator.' },
  { domain: 'dailyremote.com', reason: 'Third-party remote job board with premium paywall prompts.' },
  { domain: 'nodesk.co', reason: 'Third-party remote job aggregator.' },
  { domain: 'jobstreet.com', reason: 'Third-party regional job portal.' },
  { domain: 'seek.com.au', reason: 'Third-party regional job portal.' },
  { domain: 'glints.com', reason: 'Third-party regional job marketplace.' },
  { domain: 'kalibrr.com', reason: 'Third-party regional job portal.' },
  { domain: 'naukri.com', reason: 'Third-party job portal.' },
  { domain: 'foundit.in', reason: 'Third-party job portal.' },
  { domain: 'reed.co.uk', reason: 'Third-party agency/aggregator job board.' },
  { domain: 'totaljobs.com', reason: 'Third-party job board.' },

  // Freelance commission marketplaces (take 10-20% fee or connects fee)
  { domain: 'upwork.com', reason: 'Paid connects / commission freelance marketplace.' },
  { domain: 'fiverr.com', reason: 'Commission freelance marketplace, not a direct employer career URL.' },
  { domain: 'freelancer.com', reason: 'Paid bidding marketplace.' },
  { domain: 'peopleperhour.com', reason: 'Commission freelance marketplace.' },

  // Link shorteners & opaque redirects
  { domain: 'bit.ly', reason: 'Opaque URL shortener — LinkedOn requires transparent company URLs.' },
  { domain: 'tinyurl.com', reason: 'Opaque URL shortener — LinkedOn requires transparent company URLs.' },
  { domain: 't.co', reason: 'Opaque URL shortener — LinkedOn requires transparent company URLs.' },
  { domain: 'ow.ly', reason: 'Opaque URL shortener — LinkedOn requires transparent company URLs.' },
  { domain: 'cutt.ly', reason: 'Opaque URL shortener — LinkedOn requires transparent company URLs.' },
  { domain: 'rb.gy', reason: 'Opaque URL shortener — LinkedOn requires transparent company URLs.' },
  { domain: 'rebrand.ly', reason: 'Opaque URL shortener — LinkedOn requires transparent company URLs.' },
  { domain: 'shorturl.at', reason: 'Opaque URL shortener — LinkedOn requires transparent company URLs.' },
];

const OFFICIAL_ATS_HOSTS = [
  'greenhouse.io',
  'lever.co',
  'ashbyhq.com',
  'myworkdayjobs.com',
  'smartrecruiters.com',
  'workable.com',
  'bamboohr.com',
  'personio.de',
  'personio.com',
  'teamtailor.com',
  'recruitee.com',
  'pinpointhq.com',
];

/**
 * Validates that a URL is an HTTPS direct company career URL or official company ATS,
 * and NOT a paywalled job site, middleman aggregator, or opaque URL shortener.
 */
export function validateDirectCareerUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      valid: false,
      error: 'Please enter a valid company career URL (https://...).',
    };
  }

  let parsed;
  try {
    const trimmed = rawUrl.trim();
    parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      valid: false,
      error: 'Malformed URL. Use a full URL like https://stripe.com/jobs.',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      valid: false,
      error: 'Only HTTP/HTTPS official company career URLs are allowed.',
    };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (!hostname.includes('.') || hostname === 'localhost') {
    return {
      valid: false,
      error: 'Please provide a real public company domain (e.g., company.com/careers).',
    };
  }

  for (const blocked of BLOCKED_PAYWALL_AND_AGGREGATOR_DOMAINS) {
    if (hostname === blocked.domain || hostname.endsWith(`.${blocked.domain}`)) {
      return {
        valid: false,
        blockedDomain: blocked.domain,
        error: `Blocked (${blocked.domain}): ${blocked.reason} LinkedOn only links straight to official company career URLs.`,
      };
    }
  }

  const isOfficialAts = OFFICIAL_ATS_HOSTS.some(
    (ats) => hostname === ats || hostname.endsWith(`.${ats}`)
  );

  // Format clean display path e.g. "stripe.com/jobs" or "gotocompany.com/en/careers"
  const cleanPath = parsed.pathname && parsed.pathname !== '/'
    ? parsed.pathname.replace(/\/+$/, '')
    : '';
  const displayUrl = `${hostname}${cleanPath}`.slice(0, 56);

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    hostname,
    displayUrl,
    verificationType: isOfficialAts ? 'Official Company ATS' : 'Direct Employer Domain',
  };
}
