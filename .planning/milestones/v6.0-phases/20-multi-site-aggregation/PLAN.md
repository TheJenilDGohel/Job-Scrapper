# Phase 20 Plan: Multi-Site Aggregation (Naukri & Indeed)

## 1. Goal
Expand the scraping engine's reach beyond LinkedIn and Wellfound to capture opportunities from heavily utilized, market-specific boards like Naukri (India) and global giants like Indeed. This creates a true multi-source aggregation platform.

## 2. Technical Scope
- **Scraper Implementations**:
    - Build `src/scraper/naukriScraper.js` extending `BaseScraper`. Utilize dynamic URL construction (`/keywords-jobs-in-location`) and Puppeteer headless scraping as Naukri heavily relies on client-side rendering.
    - Build `src/scraper/indeedScraper.js` extending `BaseScraper`. Implement search query parameters (`?q=...&l=...`) and handle Indeed's strong anti-bot mechanisms.
- **Pipeline Integration**:
    - Update `src/cli/index.js` to initialize and run both new scrapers alongside existing ones.
    - Ensure the central `MatchingEngine` properly ingests, scores, and saves the new job objects from these diverse platforms.

## 3. Implementation Steps
- [x] Create `src/scraper/naukriScraper.js` using Puppeteer to navigate the dynamic site, parse the job grid, and extract `jobTitle`, `company`, `location`, `url`, and `source: 'Naukri'`.
- [x] Create `src/scraper/indeedScraper.js` using `axios` or Puppeteer as a fallback, parsing query parameters (`q` and `l`), and extracting `jobTitle`, `company`, `location`, `url`, and `source: 'Indeed'`.
- [x] Update `src/cli/index.js`:
    - Import the new scrapers.
    - Add them to the execution loop within `action(async (options) => { ... })`.
    - Combine results (`allJobs = allJobs.concat(liJobs, wfJobs, nkJobs, indJobs)`).
- [x] Update `BaseScraper` to handle potential differences in "Deep Discovery" (fetching full descriptions) for Naukri and Indeed if needed, though standard DOM parsing might suffice.

## 4. Verification & Testing
- [ ] Run `npm run cli -- --location "India"` and verify console output logs hits on all four sites.
- [ ] Verify that jobs from Naukri and Indeed appear natively within the Discovery Dashboard and Application Tracker.
- [ ] Verify that the `BaseScraper`'s enhanced email regex successfully operates on job descriptions pulled from these new sources.
