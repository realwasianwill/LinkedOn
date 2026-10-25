import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createDatabase } from './db.mjs';
import {
  validateDirectCareerUrl,
  BLOCKED_PAYWALL_AND_AGGREGATOR_DOMAINS,
} from './urlGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

export function createApiApp(dbPath) {
  const store = createDatabase(dbPath);
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));

  // Ensure iframe preview compatibility & permissive CORS for preview origins
  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'LinkedOn Direct Career API' });
  });

  app.get('/api/stats', (_req, res) => {
    res.json(store.getStats());
  });

  app.get('/api/jobs', (req, res) => {
    const jobs = store.listJobs({
      workMode: String(req.query.workMode || 'all'),
      region: String(req.query.region || 'all'),
      strictRegion: String(req.query.strictRegion || 'false'),
      category: String(req.query.category || 'all'),
      experienceLevel: String(req.query.experienceLevel || 'all'),
      timezone: String(req.query.timezone || 'all'),
      q: String(req.query.q || ''),
      sort: String(req.query.sort || 'recent'),
    });
    res.json({ jobs, count: jobs.length });
  });

  app.get('/api/jobs/:id', (req, res) => {
    const job = store.getJobById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json({ job });
  });

  app.post('/api/jobs', (req, res) => {
    const result = store.addCommunityJob(req.body || {});
    if (!result.ok) {
      res.status(400).json({
        error: result.error,
        blockedDomain: result.blockedDomain || null,
      });
      return;
    }
    res.status(201).json({ job: result.job, stats: store.getStats() });
  });

  app.get('/api/companies', (req, res) => {
    const companies = store.listCompanies({
      region: String(req.query.region || 'all'),
      category: String(req.query.category || 'all'),
      policy: String(req.query.policy || 'all'),
      q: String(req.query.q || ''),
    });
    res.json({ companies, count: companies.length });
  });

  app.post('/api/validate-url', (req, res) => {
    const result = validateDirectCareerUrl(req.body?.url || '');
    res.json(result);
  });

  app.get('/api/blocked-domains', (_req, res) => {
    res.json({
      count: BLOCKED_PAYWALL_AND_AGGREGATOR_DOMAINS.length,
      domains: BLOCKED_PAYWALL_AND_AGGREGATOR_DOMAINS,
    });
  });

  return { app, store };
}

async function startServer() {
  const { app } = createApiApp();
  const httpServer = http.createServer(app);
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT || 3000);

  if (isProd) {
    const distPath = path.join(rootDir, 'dist');
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: rootDir,
      server: {
        middlewareMode: true,
        allowedHosts: true,
        cors: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        next();
        return;
      }
      try {
        const indexHtmlPath = path.join(rootDir, 'index.html');
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (err) {
        vite.ssrFixStacktrace(err);
        next(err);
      }
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`LinkedOn running on http://0.0.0.0:${port} (${isProd ? 'production' : 'development'})`);
  });
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  startServer().catch((err) => {
    console.error('Failed to start LinkedOn server:', err);
    process.exit(1);
  });
}
