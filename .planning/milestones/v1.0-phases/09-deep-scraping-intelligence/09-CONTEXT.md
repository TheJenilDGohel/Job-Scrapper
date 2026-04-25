# Phase 9: Deep Scraping & Intelligence - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract full Job Descriptions (JD) and contact information (emails, company URLs) from matched job postings, and update the Web Dashboard to provide detailed views of these findings.
</domain>

<decisions>
## Implementation Decisions

### Extraction Strategy
- Use the existing `getJobDetails` method in `BaseScraper` which already implements JD extraction, email regex, and company URL detection.
- Ensure all specific scrapers (LinkedIn, Wellfound, etc.) correctly utilize `BaseScraper.getJobDetails` during the scraping process.

### Storage Integration
- Leverage the existing `jobDescription`, `contactEmail`, and `companyUrl` columns in the `jobs` table of the SQLite database.

### Dashboard UI
- Update the `job-modal` in `index.html` and the logic in `app.js` to render the extracted JD and contact details when a job card is clicked.

### Claude's Discretion
All implementation choices regarding regex refinement for emails and CSS selectors for JD extraction are at Claude's discretion, based on common patterns found in job boards.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BaseScraper.getJobDetails(url, companyName)`: Already contains logic for JD extraction, email regex, and company URL matching.
- `SqliteStorage`: Database schema already includes columns for `jobDescription`, `contactEmail`, and `companyUrl`.

### Established Patterns
- Scraping uses a combination of `axios` (fast) and `puppeteer` (headless fallback).
- Dashboard is a static HTML/JS frontend served by Express.

### Integration Points
- `BaseScraper` $\rightarrow$ Individual Scrapers $\rightarrow$ `SqliteStorage`.
- `SqliteStorage.getAllJobs()` $\rightarrow$ `app.js` $\rightarrow$ `index.html` (Modal).
</code_context>

<specifics>
## Specific Ideas
- Implement a "Deep Fetch" trigger: either fetch details for all matches immediately, or fetch on-demand when the user clicks a job in the dashboard. Given the "Deep Scraping" phase goal, the intent is likely to have this data available in the DB.
- Refine the email regex to be more robust against common false positives (e.g., image filenames).
</specifics>

<deferred>
## Deferred Ideas
- Automated outreach via the extracted emails (out of scope for this phase).
- AI-based JD summarization (deferred to a future intelligence phase).
</deferred>
