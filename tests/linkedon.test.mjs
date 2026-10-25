import { describe, expect, it } from 'vitest';
import { validateDirectCareerUrl } from '../server/urlGuard.mjs';
import { SEED_COMPANIES, SEED_JOBS } from '../server/seedData.mjs';
import { createApiApp } from '../server/index.mjs';

describe('LinkedOn Anti-Paywall & Direct-URL Guard', () => {
  it('blocks paywalled and generic middleman job boards', () => {
    const blockedSamples = [
      'https://www.flexjobs.com/remote-jobs/company',
      'https://jobleads.com/jobs/123',
      'https://lensa.com/job-listing',
      'https://www.virtualvocations.com/jobs',
      'https://www.indeed.com/viewjob?jk=1234',
      'https://www.linkedin.com/jobs/view/999',
      'https://www.upwork.com/freelance-jobs/',
      'https://bit.ly/secret-job-link',
    ];

    for (const url of blockedSamples) {
      const res = validateDirectCareerUrl(url);
      expect(res.valid, `Expected ${url} to be blocked`).toBe(false);
      expect(res.error).toBeTruthy();
    }
  });

  it('approves official company career URLs and official company ATS portals', () => {
    const validSamples = [
      'https://wise.jobs/',
      'https://www.gotocompany.com/en/careers',
      'https://about.gitlab.com/jobs/',
      'https://www.grab.careers/en/',
      'https://jobs.lever.co/spotify',
      'https://job-boards.greenhouse.io/cloudflare/jobs/123',
    ];

    for (const url of validSamples) {
      const res = validateDirectCareerUrl(url);
      expect(res.valid, `Expected ${url} to be valid`).toBe(true);
      expect(res.hostname).toBeTruthy();
    }
  });

  it('verifies 100% of seeded companies and jobs use direct official URLs', () => {
    expect(SEED_COMPANIES.length).toBeGreaterThanOrEqual(40);
    expect(SEED_JOBS.length).toBeGreaterThanOrEqual(45);

    for (const c of SEED_COMPANIES) {
      const check = validateDirectCareerUrl(c.careerUrl);
      expect(check.valid, `Seed company ${c.name} failed URL check`).toBe(true);
    }

    for (const j of SEED_JOBS) {
      const check = validateDirectCareerUrl(j.directUrl);
      expect(check.valid, `Seed job ${j.title} failed URL check`).toBe(true);
    }
  });
});

describe('LinkedOn Express + SQLite API Integration', () => {
  it('serves global Online and Hybrid jobs, filters accurately, and enforces paywall blocking on submissions', async () => {
    const { app } = createApiApp(':memory:');
    const server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });

    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      // 1. Stats check
      const statsRes = await fetch(`${baseUrl}/api/stats`);
      expect(statsRes.status).toBe(200);
      const stats = await statsRes.json();
      expect(stats.onlineJobs).toBeGreaterThan(20);
      expect(stats.hybridJobs).toBeGreaterThan(10);
      expect(stats.zeroPaywallGuarantee).toBe(true);

      // 2. Filter Online vs Hybrid
      const hybridRes = await fetch(`${baseUrl}/api/jobs?workMode=hybrid`);
      const hybridData = await hybridRes.json();
      expect(hybridData.jobs.length).toBe(stats.hybridJobs);
      expect(hybridData.jobs.every((j) => j.workMode === 'hybrid')).toBe(true);

      // 3. Search Jakarta / Indonesia roles
      const jakartaRes = await fetch(`${baseUrl}/api/jobs?q=Jakarta`);
      const jakartaData = await jakartaRes.json();
      expect(jakartaData.jobs.length).toBeGreaterThanOrEqual(3);

      // 4. Reject paywalled job submission (FlexJobs)
      const rejectRes = await fetch(`${baseUrl}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Fake Paywalled Job',
          companyName: 'Scam Middleman',
          directUrl: 'https://www.flexjobs.com/jobs/paywall-role',
          workMode: 'online',
        }),
      });
      expect(rejectRes.status).toBe(400);
      const rejectJson = await rejectRes.json();
      expect(rejectJson.blockedDomain).toBe('flexjobs.com');

      // 5. Accept verified direct employer career URL submission
      const createRes = await fetch(`${baseUrl}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Product Engineer (Remote)',
          companyName: 'Linear',
          directUrl: 'https://linear.app/careers',
          workMode: 'online',
          region: 'Worldwide',
          country: 'Anywhere',
          category: 'Engineering',
        }),
      });
      expect(createRes.status).toBe(201);
      const createdJson = await createRes.json();
      expect(createdJson.job.hostname).toBe('linear.app');
      expect(createdJson.job.isCommunity).toBe(true);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
