# Phase 25 Plan: Data Sanitization & Cloud Stabilization

## 1. Goal
Sanitize existing job data, aggressively recover missing intelligence (especially recruiter emails) across the entire historical database using parallel processing, and ensure robust synchronization with Supabase cloud storage.

## 2. Technical Scope
- **Data Sanitization**: Implement a utility to clean and normalize job titles, companies, and locations in the database.
- **Parallel Email Recovery**: Upgrade the existing `enrich` CLI command to utilize worker pools or high-concurrency `Promise.all` batches to process hundreds of historical jobs rapidly.
- **Supabase Hardening**: Ensure the local-to-cloud sync pipeline is fault-tolerant and correctly structured for the new schema additions (profiles, emails, URLs).

## 3. Implementation Steps
- [ ] Create `src/utils/sanitizer.js` to normalize strings, remove HTML artifacts from descriptions, and trim whitespace across all DB records.
- [ ] Update `src/cli/index.js`:
    - Add a `sanitize` command that executes the data cleaner over the local database.
    - Rewrite the `enrich` command to process jobs in parallel chunks (e.g., batches of 5-10) to respect site rate limits while maintaining high speed.
- [ ] Update `src/storage/sqliteStorage.js`:
    - Add methods for bulk updating records during sanitization.
- [ ] Update `src/storage/supabaseStorage.js`:
    - Ensure `saveJob` correctly handles the full sanitized object.
- [ ] Add `node src/cli/index.js sync` command to manually trigger a full cloud push of the local DB.

## 4. Verification & Testing
- [ ] Run `node src/cli/index.js sanitize` and verify DB records are clean.
- [ ] Run `node src/cli/index.js enrich --limit 50` and verify parallel processing speed and email extraction rate.
- [ ] Run `node src/cli/index.js sync` and verify data appears in the Supabase dashboard (if configured).
