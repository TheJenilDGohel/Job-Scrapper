# Phase 22: Intelligence Recovery & Automation Audit

## 🎯 Goal
Implement a recovery mechanism to enrich older jobs with missing contact info/descriptions and audit the automation layer (Crons) to ensure long-term stability and accurate logging.

## 🛠️ Scope
- **Storage**: Add `getJobsMissingIntelligence()` to storage layers.
- **Enrichment Engine**: Build a background task that picks up "naked" jobs (no JD or Email) and runs the deep discovery pass (Puppeteer) on them.
- **Automation Audit**:
    - Update `src/automation/cron.js` to run the enrichment task alongside the main scrape.
    - Implement persistent file-based logging for crons that the dashboard can read.
- **CLI**: Add `node src/cli/index.js enrich` command.

## 📈 Success Criteria
- Existing jobs in the DB with no email/JD are updated with intelligence.
- Cron logs are visible and traceable.
- Automation handles intermittent network failures without hanging.
