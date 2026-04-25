# Phase 20: Multi-Site Aggregation (Naukri & Indeed)

## 🎯 Goal
Expand the scraping engine's reach beyond LinkedIn and Wellfound to capture opportunities from heavily utilized, market-specific boards like Naukri (India) and global giants like Indeed. This creates a true multi-source aggregation platform.

## 🛠️ Scope
- **Scraper Implementations**:
    - Build `NaukriScraper.js` extending `BaseScraper`. Utilize dynamic URL construction (`/keywords-jobs-in-location`) and Puppeteer headless scraping as Naukri heavily relies on client-side rendering.
    - Build `IndeedScraper.js` extending `BaseScraper`. Implement search query parameters (`?q=...&l=...`) and handle Indeed's strong anti-bot mechanisms.
- **Pipeline Integration**:
    - Update `src/cli/index.js` to initialize and run both new scrapers alongside existing ones.
    - Ensure the central `MatchingEngine` properly ingests, scores, and saves the new job objects from these diverse platforms.
- **Resilience**: Implement intelligent delays and randomized User-Agents to mimic human behavior on these heavily guarded sites.

## 📈 Success Criteria
- Running `npm run cli` successfully aggregates jobs from LinkedIn, Wellfound, Naukri, and Indeed simultaneously.
- Jobs from the new sources appear natively within the Discovery Dashboard and Application Tracker.
- The `BaseScraper`'s enhanced email regex successfully operates on job descriptions pulled from these new sources.
