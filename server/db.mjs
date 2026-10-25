import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { SEED_COMPANIES, SEED_JOBS } from './seedData.mjs';
import { validateDirectCareerUrl } from './urlGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createDatabase(dbPath) {
  let resolvedPath = dbPath;
  if (!resolvedPath) {
    const dataDir = path.join(__dirname, 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    resolvedPath = path.join(dataDir, 'linkedon.db');
  }

  const db = new DatabaseSync(resolvedPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      category TEXT NOT NULL,
      work_policy TEXT NOT NULL,
      hq TEXT NOT NULL,
      regions_json TEXT NOT NULL,
      career_url TEXT NOT NULL,
      hostname TEXT NOT NULL,
      display_url TEXT NOT NULL,
      verification_type TEXT NOT NULL,
      ats_slug TEXT,
      ats_type TEXT,
      employee_count TEXT NOT NULL,
      logo_bg TEXT NOT NULL,
      initials TEXT NOT NULL,
      highlights_json TEXT NOT NULL,
      is_community INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company_id TEXT,
      company_name TEXT NOT NULL,
      company_initials TEXT NOT NULL,
      company_color TEXT NOT NULL,
      work_mode TEXT NOT NULL CHECK(work_mode IN ('online', 'hybrid')),
      location_label TEXT NOT NULL,
      region TEXT NOT NULL,
      country TEXT NOT NULL,
      category TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      employment_type TEXT NOT NULL,
      timezone_tag TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      posted_days_ago INTEGER NOT NULL DEFAULT 0,
      direct_url TEXT NOT NULL,
      hostname TEXT NOT NULL,
      display_url TEXT NOT NULL,
      verification_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      responsibilities_json TEXT NOT NULL,
      requirements_json TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      is_community INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const companyCount = db.prepare('SELECT COUNT(*) as cnt FROM companies').get().cnt;
  if (companyCount === 0) {
    const insertCompany = db.prepare(`
      INSERT INTO companies (
        id, name, tagline, category, work_policy, hq, regions_json,
        career_url, hostname, display_url, verification_type,
        ats_slug, ats_type, employee_count, logo_bg, initials, highlights_json, is_community
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    for (const c of SEED_COMPANIES) {
      const check = validateDirectCareerUrl(c.careerUrl);
      if (!check.valid) {
        throw new Error(`Invalid seed company URL for ${c.name}: ${check.error}`);
      }
      insertCompany.run(
        c.id,
        c.name,
        c.tagline,
        c.category,
        c.workPolicy,
        c.hq,
        JSON.stringify(c.regions),
        check.normalizedUrl,
        check.hostname,
        check.displayUrl,
        check.verificationType,
        c.atsSlug,
        c.atsType,
        c.employeeCount,
        c.logoBg,
        c.initials,
        JSON.stringify(c.highlights)
      );
    }
  }

  const jobCount = db.prepare('SELECT COUNT(*) as cnt FROM jobs').get().cnt;
  if (jobCount === 0) {
    const insertJob = db.prepare(`
      INSERT INTO jobs (
        id, title, company_id, company_name, company_initials, company_color,
        work_mode, location_label, region, country, category, experience_level,
        employment_type, timezone_tag, salary_range, posted_days_ago,
        direct_url, hostname, display_url, verification_type,
        summary, responsibilities_json, requirements_json, tags_json, is_community
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    for (const j of SEED_JOBS) {
      const check = validateDirectCareerUrl(j.directUrl);
      if (!check.valid) {
        throw new Error(`Invalid seed job URL for ${j.title}: ${check.error}`);
      }
      insertJob.run(
        j.id,
        j.title,
        j.companyId,
        j.companyName,
        j.companyInitials,
        j.companyColor,
        j.workMode,
        j.locationLabel,
        j.region,
        j.country,
        j.category,
        j.experienceLevel,
        j.employmentType,
        j.timezoneTag,
        j.salaryRange,
        j.postedDaysAgo,
        check.normalizedUrl,
        check.hostname,
        check.displayUrl,
        check.verificationType,
        j.summary,
        JSON.stringify(j.responsibilities),
        JSON.stringify(j.requirements),
        JSON.stringify(j.tags)
      );
    }
  }

  function mapJobRow(row) {
    return {
      id: row.id,
      title: row.title,
      companyId: row.company_id,
      companyName: row.company_name,
      companyInitials: row.company_initials,
      companyColor: row.company_color,
      workMode: row.work_mode,
      locationLabel: row.location_label,
      region: row.region,
      country: row.country,
      category: row.category,
      experienceLevel: row.experience_level,
      employmentType: row.employment_type,
      timezoneTag: row.timezone_tag,
      salaryRange: row.salary_range,
      postedDaysAgo: row.posted_days_ago,
      directUrl: row.direct_url,
      hostname: row.hostname,
      displayUrl: row.display_url,
      verificationType: row.verification_type,
      summary: row.summary,
      responsibilities: JSON.parse(row.responsibilities_json),
      requirements: JSON.parse(row.requirements_json),
      tags: JSON.parse(row.tags_json),
      isCommunity: Boolean(row.is_community),
    };
  }

  function mapCompanyRow(row) {
    return {
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      category: row.category,
      workPolicy: row.work_policy,
      hq: row.hq,
      regions: JSON.parse(row.regions_json),
      careerUrl: row.career_url,
      hostname: row.hostname,
      displayUrl: row.display_url,
      verificationType: row.verification_type,
      atsSlug: row.ats_slug,
      atsType: row.ats_type,
      employeeCount: row.employee_count,
      logoBg: row.logo_bg,
      initials: row.initials,
      highlights: JSON.parse(row.highlights_json),
      isCommunity: Boolean(row.is_community),
    };
  }

  return {
    db,

    getStats() {
      const totalJobs = db.prepare('SELECT COUNT(*) as cnt FROM jobs').get().cnt;
      const onlineJobs = db
        .prepare("SELECT COUNT(*) as cnt FROM jobs WHERE work_mode = 'online'")
        .get().cnt;
      const hybridJobs = db
        .prepare("SELECT COUNT(*) as cnt FROM jobs WHERE work_mode = 'hybrid'")
        .get().cnt;
      const worldwideJobs = db
        .prepare("SELECT COUNT(*) as cnt FROM jobs WHERE region = 'Worldwide'")
        .get().cnt;
      const totalCompanies = db.prepare('SELECT COUNT(*) as cnt FROM companies').get().cnt;

      return {
        totalJobs,
        onlineJobs,
        hybridJobs,
        worldwideJobs,
        totalCompanies,
        zeroPaywallGuarantee: true,
      };
    },

    listJobs(filters = {}) {
      const conditions = [];
      const params = [];

      if (filters.workMode && filters.workMode !== 'all') {
        if (filters.workMode === 'worldwide') {
          conditions.push("work_mode = 'online' AND region = 'Worldwide'");
        } else {
          conditions.push('work_mode = ?');
          params.push(filters.workMode);
        }
      }

      if (filters.region && filters.region !== 'all') {
        if (filters.region === 'Worldwide') {
          conditions.push("region = 'Worldwide'");
        } else {
          // Include region-specific jobs AND Worldwide Work-from-Anywhere online jobs if includeWorldwide is not 'false'
          if (filters.strictRegion === 'true') {
            conditions.push('region = ?');
            params.push(filters.region);
          } else {
            conditions.push("(region = ? OR region = 'Worldwide')");
            params.push(filters.region);
          }
        }
      }

      if (filters.category && filters.category !== 'all') {
        conditions.push('category = ?');
        params.push(filters.category);
      }

      if (filters.experienceLevel && filters.experienceLevel !== 'all') {
        conditions.push('experience_level = ?');
        params.push(filters.experienceLevel);
      }

      if (filters.timezone && filters.timezone !== 'all') {
        conditions.push("(timezone_tag = ? OR timezone_tag = 'Async / Any Timezone')");
        params.push(filters.timezone);
      }

      if (filters.q && filters.q.trim()) {
        const like = `%${filters.q.trim().toLowerCase()}%`;
        conditions.push(`(
          LOWER(title) LIKE ? OR
          LOWER(company_name) LIKE ? OR
          LOWER(location_label) LIKE ? OR
          LOWER(country) LIKE ? OR
          LOWER(category) LIKE ? OR
          LOWER(summary) LIKE ? OR
          LOWER(tags_json) LIKE ? OR
          LOWER(hostname) LIKE ?
        )`);
        params.push(like, like, like, like, like, like, like, like);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      let orderClause = 'ORDER BY is_community DESC, posted_days_ago ASC, title ASC';
      if (filters.sort === 'company') {
        orderClause = 'ORDER BY company_name ASC, posted_days_ago ASC';
      } else if (filters.sort === 'title') {
        orderClause = 'ORDER BY title ASC';
      }

      const rows = db
        .prepare(`SELECT * FROM jobs ${whereClause} ${orderClause}`)
        .all(...params);
      return rows.map(mapJobRow);
    },

    getJobById(id) {
      const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      return row ? mapJobRow(row) : null;
    },

    listCompanies(filters = {}) {
      const conditions = [];
      const params = [];

      if (filters.region && filters.region !== 'all') {
        conditions.push('(regions_json LIKE ? OR regions_json LIKE ?)');
        params.push(`%"${filters.region}"%`, '%"Worldwide"%');
      }

      if (filters.category && filters.category !== 'all') {
        conditions.push('category = ?');
        params.push(filters.category);
      }

      if (filters.policy && filters.policy !== 'all') {
        if (filters.policy === 'online') {
          conditions.push("LOWER(work_policy) LIKE '%online%'");
        } else if (filters.policy === 'hybrid') {
          conditions.push("LOWER(work_policy) LIKE '%hybrid%'");
        }
      }

      if (filters.q && filters.q.trim()) {
        const like = `%${filters.q.trim().toLowerCase()}%`;
        conditions.push(`(
          LOWER(name) LIKE ? OR
          LOWER(tagline) LIKE ? OR
          LOWER(hq) LIKE ? OR
          LOWER(category) LIKE ? OR
          LOWER(hostname) LIKE ?
        )`);
        params.push(like, like, like, like, like);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const rows = db
        .prepare(`SELECT * FROM companies ${whereClause} ORDER BY is_community DESC, name ASC`)
        .all(...params);
      return rows.map(mapCompanyRow);
    },

    addCommunityJob(payload) {
      const check = validateDirectCareerUrl(payload.directUrl);
      if (!check.valid) {
        return { ok: false, error: check.error, blockedDomain: check.blockedDomain };
      }

      const title = (payload.title || '').trim();
      const companyName = (payload.companyName || '').trim();
      if (!title || !companyName) {
        return { ok: false, error: 'Role title and company name are required.' };
      }

      const workMode = payload.workMode === 'hybrid' ? 'hybrid' : 'online';
      const region = payload.region || 'Worldwide';
      const country = (payload.country || (region === 'Worldwide' ? 'Anywhere' : region)).trim();
      const locationLabel = (
        payload.locationLabel ||
        (workMode === 'online' ? `${country} (100% Online)` : `${country} (Hybrid)`)
      ).trim();
      const category = payload.category || 'Engineering';
      const experienceLevel = payload.experienceLevel || 'Mid-Level';
      const employmentType = payload.employmentType || 'Full-Time';
      const timezoneTag = payload.timezoneTag || 'Async / Any Timezone';
      const salaryRange = (payload.salaryRange || 'Listed on Company Portal').trim();
      const summary = (
        payload.summary ||
        `Direct ${workMode === 'online' ? 'Online / Remote' : 'Hybrid'} opportunity at ${companyName}. Apply straight on the employer's official career portal with $0 middleman fees.`
      ).trim();

      const initials = companyName
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('') || 'CO';

      const palette = ['#0F766E', '#1D4ED8', '#7C3AED', '#B45309', '#BE123C', '#047857'];
      const color = palette[companyName.length % palette.length];
      const id = `job-comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const tags = Array.isArray(payload.tags) && payload.tags.length > 0
        ? payload.tags.slice(0, 5)
        : ['Community Verified', workMode === 'online' ? '100% Online' : 'Hybrid', 'Direct Career URL'];

      db.prepare(`
        INSERT INTO jobs (
          id, title, company_id, company_name, company_initials, company_color,
          work_mode, location_label, region, country, category, experience_level,
          employment_type, timezone_tag, salary_range, posted_days_ago,
          direct_url, hostname, display_url, verification_type,
          summary, responsibilities_json, requirements_json, tags_json, is_community
        ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        id,
        title,
        companyName,
        initials,
        color,
        workMode,
        locationLabel,
        region,
        country,
        category,
        experienceLevel,
        employmentType,
        timezoneTag,
        salaryRange,
        check.normalizedUrl,
        check.hostname,
        check.displayUrl,
        check.verificationType,
        summary,
        JSON.stringify([
          `Collaborate with ${companyName}'s ${workMode === 'online' ? 'distributed online' : 'hybrid'} team.`,
          'Review full role scope and submit your application directly on the official employer career portal.',
        ]),
        JSON.stringify([
          'Relevant experience aligned with the official job description on the employer site.',
          'Never pay any middleman fee — apply directly via the verified company URL.',
        ]),
        JSON.stringify(tags)
      );

      return { ok: true, job: this.getJobById(id) };
    },
  };
}
