export type WorkMode = 'online' | 'hybrid';

export type GlobalRegion =
  | 'Worldwide'
  | 'Asia-Pacific'
  | 'Europe'
  | 'North America'
  | 'Latin America'
  | 'Middle East & Africa';

export type JobCategory =
  | 'Engineering'
  | 'Customer Support'
  | 'Design & Creative'
  | 'Marketing & Content'
  | 'Operations & HR'
  | 'Finance & Legal'
  | 'Data & AI'
  | 'Product'
  | 'Sales & Growth'
  | 'Education & Healthcare';

export type ExperienceLevel = 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead';

export interface Job {
  id: string;
  title: string;
  companyId: string | null;
  companyName: string;
  companyInitials: string;
  companyColor: string;
  workMode: WorkMode;
  locationLabel: string;
  region: GlobalRegion | string;
  country: string;
  category: JobCategory | string;
  experienceLevel: ExperienceLevel | string;
  employmentType: string;
  timezoneTag: string;
  salaryRange: string;
  postedDaysAgo: number;
  directUrl: string;
  hostname: string;
  displayUrl: string;
  verificationType: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  tags: string[];
  isCommunity?: boolean;
  isLiveAts?: boolean;
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  category: string;
  workPolicy: string;
  hq: string;
  regions: string[];
  careerUrl: string;
  hostname: string;
  displayUrl: string;
  verificationType: string;
  atsSlug: string | null;
  atsType: string | null;
  employeeCount: string;
  logoBg: string;
  initials: string;
  highlights: string[];
  isCommunity?: boolean;
}

export interface DirectoryStats {
  totalJobs: number;
  onlineJobs: number;
  hybridJobs: number;
  worldwideJobs: number;
  totalCompanies: number;
  zeroPaywallGuarantee: boolean;
}

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offer';

export interface SavedJobEntry {
  job: Job;
  status: ApplicationStatus;
  savedAt: string;
  notes: string;
}

export interface BlockedDomainInfo {
  domain: string;
  reason: string;
}
