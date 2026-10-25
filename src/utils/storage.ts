import { ApplicationStatus, Job, SavedJobEntry } from '../types';

const SAVED_JOBS_KEY = 'linkedon_saved_jobs_v1';
const THEME_KEY = 'linkedon_theme_v1';

export function loadSavedJobs(): Record<string, SavedJobEntry> {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SavedJobEntry>;
  } catch {
    return {};
  }
}

export function persistSavedJobs(entries: Record<string, SavedJobEntry>): void {
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota issues
  }
}

export function toggleSaveJob(
  current: Record<string, SavedJobEntry>,
  job: Job
): Record<string, SavedJobEntry> {
  const next = { ...current };
  if (next[job.id]) {
    delete next[job.id];
  } else {
    next[job.id] = {
      job,
      status: 'saved',
      savedAt: new Date().toISOString(),
      notes: '',
    };
  }
  persistSavedJobs(next);
  return next;
}

export function upsertJobStatus(
  current: Record<string, SavedJobEntry>,
  job: Job,
  status: ApplicationStatus
): Record<string, SavedJobEntry> {
  const existing = current[job.id];
  const next = {
    ...current,
    [job.id]: {
      job,
      status,
      savedAt: existing?.savedAt || new Date().toISOString(),
      notes: existing?.notes || '',
    },
  };
  persistSavedJobs(next);
  return next;
}

export function updateJobNotes(
  current: Record<string, SavedJobEntry>,
  jobId: string,
  notes: string
): Record<string, SavedJobEntry> {
  if (!current[jobId]) return current;
  const next = {
    ...current,
    [jobId]: {
      ...current[jobId],
      notes,
    },
  };
  persistSavedJobs(next);
  return next;
}

export function exportSavedJobsCsv(entries: SavedJobEntry[]): void {
  const headers = [
    'Role Title',
    'Company',
    'Work Mode',
    'Region',
    'Location',
    'Status',
    'Direct Company Career URL',
    'Saved Date',
    'Notes',
  ];

  const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

  const rows = entries.map((e) => [
    escapeCsv(e.job.title),
    escapeCsv(e.job.companyName),
    escapeCsv(e.job.workMode === 'online' ? 'Online (100% Remote)' : 'Hybrid'),
    escapeCsv(e.job.region),
    escapeCsv(e.job.locationLabel),
    escapeCsv(e.status.toUpperCase()),
    escapeCsv(e.job.directUrl),
    escapeCsv(new Date(e.savedAt).toLocaleDateString()),
    escapeCsv(e.notes),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `LinkedOn-Direct-Jobs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }
  return 'light';
}

export function saveThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
