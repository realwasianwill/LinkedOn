import { Job } from '../types';

interface GreenhouseBoardSource {
  slug: string;
  companyName: string;
  initials: string;
  color: string;
  companyId: string;
}

const PUBLIC_COMPANY_BOARDS: GreenhouseBoardSource[] = [
  { slug: 'gitlab', companyName: 'GitLab', initials: 'GL', color: '#FC6D26', companyId: 'comp-gitlab' },
  { slug: 'cloudflare', companyName: 'Cloudflare', initials: 'CF', color: '#F38020', companyId: 'comp-cloudflare' },
  { slug: 'stripe', companyName: 'Stripe', initials: 'ST', color: '#635BFF', companyId: 'comp-stripe' },
  { slug: 'vercel', companyName: 'Vercel', initials: 'VC', color: '#111827', companyId: 'comp-vercel' },
  { slug: 'figma', companyName: 'Figma', initials: 'FG', color: '#F24E1E', companyId: 'comp-figma' },
  { slug: 'elastic', companyName: 'Elastic', initials: 'EL', color: '#00BFB3', companyId: 'comp-elastic' },
];

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (/(design|ux|ui|brand|creative|illustrator)/.test(t)) return 'Design & Creative';
  if (/(support|customer|advocate|cx|success|happiness)/.test(t)) return 'Customer Support';
  if (/(marketing|content|seo|writer|social|communications|brand)/.test(t)) return 'Marketing & Content';
  if (/(data|machine learning|ml|ai|analytics|scientist)/.test(t)) return 'Data & AI';
  if (/(product manager|program manager|tpm|product lead)/.test(t)) return 'Product';
  if (/(account executive|sales|partner|business development|gtm|solutions)/.test(t)) return 'Sales & Growth';
  if (/(legal|counsel|finance|tax|accounting|compliance|risk|payroll|treasury)/.test(t)) return 'Finance & Legal';
  if (/(recruiter|people|hr|talent|workplace|operations)/.test(t)) return 'Operations & HR';
  return 'Engineering';
}

function inferRegion(loc: string): { region: string; country: string; timezoneTag: string } {
  const l = loc.toLowerCase();
  if (/(global|worldwide|anywhere|all-remote|distributed)/.test(l)) {
    return { region: 'Worldwide', country: 'Anywhere', timezoneTag: 'Async / Any Timezone' };
  }
  if (/(singapore|indonesia|jakarta|japan|tokyo|australia|sydney|india|bengaluru|manila|philippines|korea|apac|malaysia|thailand)/.test(l)) {
    return { region: 'Asia-Pacific', country: 'APAC', timezoneTag: 'APAC Friendly (UTC+5 to UTC+11)' };
  }
  if (/(uk|united kingdom|london|germany|berlin|france|paris|spain|netherlands|amsterdam|ireland|dublin|portugal|lisbon|poland|emea|europe|sweden)/.test(l)) {
    return { region: 'Europe', country: 'Europe', timezoneTag: 'EMEA Friendly (UTC-1 to UTC+4)' };
  }
  if (/(brazil|são paulo|mexico|colombia|argentina|chile|latam)/.test(l)) {
    return { region: 'Latin America', country: 'LATAM', timezoneTag: 'Americas Friendly (UTC-8 to UTC-3)' };
  }
  if (/(uae|dubai|south africa|nigeria|kenya|egypt|israel)/.test(l)) {
    return { region: 'Middle East & Africa', country: 'MEA', timezoneTag: 'EMEA Friendly (UTC-1 to UTC+4)' };
  }
  return { region: 'North America', country: 'Americas', timezoneTag: 'Americas Friendly (UTC-8 to UTC-3)' };
}

function inferExperience(title: string): string {
  const t = title.toLowerCase();
  if (/(staff|principal|lead|director|head )/.test(t)) return 'Lead';
  if (/(senior|sr\.|sr )/.test(t)) return 'Senior';
  if (/(junior|jr|associate|intern|entry|graduate)/.test(t)) return 'Entry-Level';
  return 'Mid-Level';
}

export async function fetchLiveCompanyAtsJobs(): Promise<{
  jobs: Job[];
  syncedCompanies: string[];
}> {
  const results = await Promise.allSettled(
    PUBLIC_COMPANY_BOARDS.map(async (board) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch(
          `https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs`,
          { signal: controller.signal }
        );
        if (!res.ok) return { board, items: [] as Job[] };
        const data = await res.json();
        const rawJobs: Array<{
          id: number;
          title: string;
          absolute_url: string;
          updated_at?: string;
          location?: { name?: string };
        }> = Array.isArray(data?.jobs) ? data.jobs : [];

        // Keep roles that explicitly mention remote, online, distributed, anywhere, or hybrid
        const eligible = rawJobs
          .filter((item) => {
            const text = `${item.title || ''} ${item.location?.name || ''}`.toLowerCase();
            return /(remote|hybrid|distributed|anywhere|home)/.test(text);
          })
          .slice(0, 5);

        const mapped: Job[] = eligible.map((item) => {
          const locName = item.location?.name || 'Remote';
          const isHybrid = /hybrid/i.test(`${item.title} ${locName}`);
          const { region, country, timezoneTag } = inferRegion(locName);
          let hostname = 'greenhouse.io';
          let displayUrl = 'greenhouse.io';
          try {
            const parsed = new URL(item.absolute_url);
            hostname = parsed.hostname.replace(/^www\./, '');
            displayUrl = `${hostname}${parsed.pathname}`.slice(0, 52);
          } catch {
            // fallback
          }

          return {
            id: `live-${board.slug}-${item.id}`,
            title: item.title,
            companyId: board.companyId,
            companyName: board.companyName,
            companyInitials: board.initials,
            companyColor: board.color,
            workMode: isHybrid ? 'hybrid' : 'online',
            locationLabel: locName,
            region,
            country,
            category: inferCategory(item.title),
            experienceLevel: inferExperience(item.title),
            employmentType: 'Full-Time',
            timezoneTag,
            salaryRange: 'Listed on Official Application',
            postedDaysAgo: 0,
            directUrl: item.absolute_url,
            hostname,
            displayUrl,
            verificationType: hostname.includes('greenhouse.io')
              ? 'Official Company ATS'
              : 'Direct Employer Domain',
            summary: `Live opening pulled directly from ${board.companyName}'s official public career feed (${hostname}). Click through to read the full specification and apply straight to ${board.companyName}'s hiring team with $0 middleman fees.`,
            responsibilities: [
              `Join ${board.companyName}'s ${isHybrid ? 'hybrid' : 'distributed remote'} team in ${locName}.`,
              'Review full job description, compensation band, and team charter on the official application page.',
            ],
            requirements: [
              'Apply directly via the verified company URL — never through a paid aggregator.',
            ],
            tags: ['Live ATS Sync', isHybrid ? 'Hybrid' : 'Online / Remote', board.companyName],
            isLiveAts: true,
          };
        });

        return { board, items: mapped };
      } finally {
        clearTimeout(timer);
      }
    })
  );

  const collected: Job[] = [];
  const syncedCompanies: string[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.items.length > 0) {
      collected.push(...r.value.items);
      syncedCompanies.push(r.value.board.companyName);
    }
  }

  return { jobs: collected, syncedCompanies };
}
