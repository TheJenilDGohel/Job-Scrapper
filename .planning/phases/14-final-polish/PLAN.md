# Phase 14 Plan: Final Polish & Live Sync

Implement the "Command Center" UI and hourly automation sync.

## 📋 Steps

### 1. Automation & Depth
- [ ] Update `src/automation/cron.js`:
    - Change cron to `0 * * * *` (Hourly).
    - Add a `runImmediately()` call at startup.
- [ ] Update `.github/workflows/scraper.yml`:
    - Change schedule cron to `0 * * * *`.
- [ ] Update `src/scraper/linkedinScraper.js` and `wellfoundScraper.js`:
    - Implement a simple page loop to fetch at least 2 pages of results.

### 2. Backend API
- [ ] Update `src/server/index.js`:
    - Add `POST /api/scrape` endpoint (Triggers the CLI process).
    - Add `GET /api/status` (Returns last run time and scraping status).

### 3. Frontend "Command Center"
- [ ] Update `src/server/public/index.html`:
    - Introduce `<aside class="sidebar">` for stats and filters.
    - Move search box and buttons into sidebar.
    - Add "Sync Jobs" button and "Last Sync" display.
- [ ] Update `src/server/public/style.css`:
    - Implement Sidebar/Main Content flex layout.
    - Style the Sidebar (glassmorphism vertical bar).
    - Refine job card density.
- [ ] Update `src/server/public/app.js`:
    - Implement the "Sync" button logic (calls `/api/scrape`).
    - Handle polling for status during sync.
    - Update stats and sidebar state.

## 🧪 Verification
- Run `npm run cron` and verify it starts a scrape immediately.
- Open Dashboard, click "Sync Jobs", and verify it triggers a background process.
- Check Sidebar layout on different screen sizes.
