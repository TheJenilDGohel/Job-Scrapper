# Phase 14 Context: Final Polish & Live Sync

## 🎯 Goal
Address the user's feedback by optimizing the automation frequency, ensuring immediate data availability, and upgrading the UI to a "Command Center" aesthetic.

## 🛠️ Decisions

### 1. Automation & Cron
- **Frequency**: Update schedule to run **every 1 hour** (`0 * * * *`).
- **Startup**: The cron worker will trigger an **immediate scrape** upon startup to ensure the database is fresh without waiting for the next hour.
- **Scraper Depth**: Increase LinkedIn and Wellfound scraper depth to **2 pages** each to ensure more jobs are discovered.

### 2. UI/UX "Command Center" Upgrade
- **Sidebar**: Implement a left-hand sidebar for:
  - Global Stats (Total, Top Matches, Avg Score).
  - Search & Category Filters.
  - "Last Scraped" status indicator.
- **Refresh Button**: Add a "Sync Now" button in the sidebar that:
  - Triggers a background scrape via a new `/api/scrape` endpoint.
  - Shows a real-time status (e.g., "Scraping...") on the UI.
- **Layout**: Transition the main job grid to be more dense, allowing for better scannability.

### 3. Technical Integration
- **API Endpoint**: Add `POST /api/scrape` to `src/server/index.js` to allow manual triggers (protected by `INTERNAL_SESSION_TOKEN`).
- **State Tracking**: Track "Last Successful Run" in a new `system_meta` table in Supabase or a local file if needed, to display in the UI.

## 🚀 Canonical Refs
- [ROADMAP.md](file:///c:/Jenil/Job%20Scrapper/.planning/ROADMAP.md)
- [src/automation/cron.js](file:///c:/Jenil/Job%20Scrapper/src/automation/cron.js)
- [src/server/index.js](file:///c:/Jenil/Job%20Scrapper/src/server/index.js)
- [src/server/public/app.js](file:///c:/Jenil/Job%20Scrapper/src/server/public/app.js)
