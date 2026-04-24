# Project Roadmap

## Milestone 1: Core Engine & CLI
*Status: Planned*
*Goal: Build the CV parser, scraper engine, matching logic, and CLI output.*

- [x] **Phase 1: Project Setup & Storage**
  - Setup Node.js project.
  - Implement basic JSON and SQLite storage interfaces.
- [x] **Phase 2: CV Intelligence Engine**
  - Implement PDF parsing using `pdf-parse`.
  - Extract skills, roles, experience, and keywords into a structured profile.
- [x] **Phase 3: Scraper Engine Core**
  - Setup `axios` and `cheerio` for fast scraping.
  - Setup `puppeteer` for fallback.
  - Implement anti-block utilities (random delays, user-agent rotation).
- [x] **Phase 4: Job Source Integrations**
  - Implement LinkedIn public search scraper.
  - Implement Indeed / Wellfound scrapers.
  - Implement basic Company Career page crawler.
- [x] **Phase 5: Matching Engine**
  - Implement scoring logic (skillMatch * 0.5 + titleMatch * 0.3 + experienceMatch * 0.2).
  - Implement keyword and fuzzy matching.
- [x] **Phase 6: CLI & Automation**
  - Build CLI to display top jobs.
  - Implement `node-cron` automation for periodic fetching.

## Milestone 2: Dashboard & Alerts
*Status: Planned*
*Goal: Add Express.js dashboard and Telegram alerts.*

- [x] **Phase 7: Web Dashboard**
  - Setup Express.js server.
  - Build simple frontend with HTML + Tailwind to view matches.
- [x] **Phase 8: Alert System**
  - Integrate Telegram bot for alerts.
  - Integrate Nodemailer for email alerts.
- [x] **Phase 9: Deep Scraping & Intelligence**
  - Extract full Job Descriptions (JD).
  - Detect contact emails and company URLs.
  - Update Dashboard with detailed job views.

## Milestone 3: Cloud Scaling & Localization
*Status: Planned*
*Goal: Migrate to Supabase for production and localize scrapers for India.*

- [x] **Phase 10: Supabase Transition** (Completed)
  - [x] Implement Supabase storage adapter
  - [x] Create storage factory for seamless switching
  - [x] Configure cloud environment variables
- [x] **Phase 11: Market Localization** (Completed)
  - [x] Add geography parameter to scrapers
  - [x] Target Indian job boards/locations by default
  - [x] Update CLI with `--location` flag
- [x] **Phase 12: Production Hardening** (Completed)
  - [x] Implement robust error handling for rate limits
  - [x] Add basic auth to dashboard
  - [x] Create deployment script for cloud hosting (e.g. Railway/Heroku)

- [x] **Phase 13: UI/UX Premium Overhaul** (Completed)
  - [x] Apply glassmorphism and modern design tokens
  - [x] Implement smooth transitions and micro-animations
  - [x] Improve responsiveness and layout density
- [x] Phase 14: Final Polish & Live Sync (Premium UI, Hourly Automation)
    - [x] Update cron to hourly + startup run
    - [x] Implement Sidebar "Command Center" UI
    - [x] Add "Manual Refresh" trigger with background sync
    - [x] Increase scraper depth (2+ pages) to UI
  - [ ] Optimize UI layout with a Sidebar and Filter system

### Phase 13: UI/UX Premium Overhaul
**Goal:** Transform the dashboard into a high-end, premium experience.
**Depends on:** Phase 12
**Plans:** 0 plans

---
*Last updated: 2026-04-22*

### Phase 1: Project Setup & Storage
**Goal:** Setup project and storage.
**Success Criteria:**
- Node.js project initialized.
- JSON storage interface implemented.
- SQLite storage interface implemented.

### Phase 2: CV Intelligence Engine
**Goal:** Implement PDF parsing and profile extraction.
**Success Criteria:**
- PDF content extracted using pdf-parse.
- Skills, roles, and experience structured into a profile.

### Phase 3: Scraper Engine Core
**Goal:** Setup scraping infrastructure.
**Success Criteria:**
- Axios and Cheerio functional.
- Puppeteer fallback operational.
- Anti-block utilities (rotations, delays) implemented.

### Phase 4: Job Source Integrations
**Goal:** Implement scrapers for target job sites.
**Success Criteria:**
- LinkedIn public search scraper working.
- Indeed/Wellfound scrapers working.
- Company Career page crawler implemented.

### Phase 5: Matching Engine
**Goal:** Implement scoring and matching logic.
**Success Criteria:**
- Weighted scoring logic implemented.
- Keyword and fuzzy matching operational.

### Phase 6: CLI & Automation
**Goal:** Build CLI and cron automation.
**Success Criteria:**
- CLI displays top job matches.
- node-cron automation periodically fetches new jobs.

### Phase 7: Web Dashboard
**Goal:** Setup Express.js dashboard.
**Success Criteria:**
- Express server running.
- Dashboard UI with Tailwind displaying matches.

### Phase 8: Alert System
**Goal:** Integrate Telegram and Email alerts.
**Success Criteria:**
- Telegram bot sending match alerts.
- Nodemailer sending email notifications.

### Phase 9: Deep Scraping & Intelligence
**Goal:** Extract full JDs and contact info.
**Success Criteria:**
- Full Job Descriptions extracted for matches.
- Contact emails and company URLs detected.
- Dashboard updated with detailed views.

### Phase 10: Supabase Transition
**Goal:** Migrate to Supabase for production.
**Success Criteria:**
- Supabase storage adapter functional.
- Storage factory handles environment-based switching.
- Production environment variables configured.

### Phase 11: Market Localization
**Goal:** Target Indian job markets and localize scrapers.
**Success Criteria:**
- Geography parameter added to scrapers.
- Default search targets Indian cities/regions.
- CLI supports --location flag.

### Phase 12: Production Hardening
**Goal:** Secure the application and prepare for production deployment.
**Success Criteria:**
- Robust error handling for rate limits and scraper failures.
- Secure session-based authentication for the dashboard.
- Deployment configuration for cloud hosting.
