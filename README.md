# LinkedOn

**Find Online & Hybrid Jobs Easier — without paying a single dime.**

LinkedOn is a global career discovery directory that routes job seekers **straight to official company career URLs** (`wise.jobs`, `about.gitlab.com/jobs`, `gotocompany.com/en/careers`, `grab.careers`, `canva.com/careers`, `deel.com/careers`, `international.nubank.com.br/careers`, etc.) with **zero subscription paywalls, zero email-gated middlemen, and zero tracking redirects**.

## Key Features

- **Global Online (100% Remote) & Hybrid Filtering**: Filter across **Worldwide (Work from Anywhere)**, **Asia-Pacific**, **Europe**, **North America**, **Latin America**, and **Middle East & Africa**, plus departments, experience levels (including **Entry-Level Friendly**), and timezone windows.
- **Transparent Destination Pills**: Every job card and company portal displays the verified employer hostname in monospace before you click, paired with 1-click URL copy and native direct `<a>` links.
- **44+ Verified Global Company Career Portals**: Jump straight into the official career portals of top remote-first and hybrid employers worldwide.
- **Live Official Company ATS Sync**: Optional 1-click browser sync pulling live Remote & Hybrid postings directly from official company public Greenhouse career feeds.
- **Anti-Paywall & Anti-Aggregator Shield**: Actively blocks 45+ subscription job sites (`flexjobs.com`, `jobleads.com`, `lensa.com`, `virtualvocations.com`), generic middleman job aggregators (`indeed.com`, `linkedin.com`, `glassdoor.com`), freelance commission platforms, and opaque link shorteners.
- **Private Local Application Tracker**: Bookmark roles, track statuses (`Saved` → `Applied` → `Interviewing` → `Offer`), keep private notes, and export to CSV — 100% locally in your browser with no sign-up required.

## Quick Start

```bash
npm install
npm run dev
```

The unified Express + SQLite (`node:sqlite`) + Vite server starts on `http://0.0.0.0:3000`.

### Scripts

- `npm run dev` — Run unified Express API + Vite frontend server on port `3000`
- `npm run build` — Typecheck & build production frontend bundle (`dist/`)
- `npm start` — Run production Express + SQLite server serving `dist/`
- `npm test` — Run Vitest suite verifying URL anti-paywall guardrails & API integration
