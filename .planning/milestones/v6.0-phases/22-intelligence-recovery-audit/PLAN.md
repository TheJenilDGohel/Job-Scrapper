# Phase 22 Plan: Intelligence Recovery & Automation Audit

## 1. Storage Enhancements
- [ ] Update `src/storage/sqliteStorage.js`:
    - Add `getJobsMissingIntelligence()`: Select jobs where `contactEmail` is null AND `jobDescription` is null.
- [ ] Update `src/storage/supabaseStorage.js`:
    - Add `getJobsMissingIntelligence()` matching logic.

## 2. Enrichment Logic (CLI)
- [ ] Update `src/cli/index.js`:
    - Add `enrich` command.
    - Logic: 
        1. Fetch missing jobs from storage.
        2. Initialize `LinkedinScraper` (for `getJobDetails`).
        3. Iterate through jobs, perform deep discovery.
        4. Save updated job data.

## 3. Automation Audit (Cron)
- [ ] Update `src/automation/cron.js`:
    - Chain the `run` and `enrich` commands.
    - Improve error logging and capture stdout/stderr to a dedicated `logs/cron-status.log`.
    - Ensure background processes don't zombie if an error occurs.

## 4. Frontend Integration (Optional but Good)
- [ ] Add a "System Status" or "Sync Logs" toggle in the sidebar to view the last 50 lines of cron logs.

## 5. Verification
- [ ] Verify `node src/cli/index.js enrich` updates a test job.
- [ ] Verify cron triggers both tasks successfully.
