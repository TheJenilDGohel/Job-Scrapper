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

---
*Last updated: 2026-04-22*
