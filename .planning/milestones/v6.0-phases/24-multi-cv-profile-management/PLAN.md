# Phase 24 Plan: Multi-CV & Profile Management

## 1. Storage & Schema Migration
- [ ] Update `src/storage/sqliteStorage.js`:
    - Create `profiles` table: `id`, `name`, `roles`, `skills`, `experience`, `cvText`, `isDefault`.
    - Add `profileId` column to `jobs` table (nullable for legacy jobs).
    - Implement methods: `saveProfile()`, `getProfiles()`, `deleteProfile()`, `setDefaultProfile()`.
- [ ] Update `src/storage/supabaseStorage.js`:
    - Mirror schema changes for Supabase parity.

## 2. Backend: Profile Management API
- [ ] Update `src/server/index.js`:
    - Add `GET /api/v1/internal/profiles` to list all career profiles.
    - Add `POST /api/v1/internal/profiles` to create a new profile from a CV upload (using `multer` for multipart PDF handling).
    - Add `DELETE /api/v1/internal/profiles/:id`.
    - Add `PATCH /api/v1/internal/profiles/:id/default`.

## 3. Scraper & Engine Integration
- [ ] Update `src/cli/index.js` and `src/automation/cron.js`:
    - Iterate through all active profiles during a scrape cycle.
    - Tag each job with the corresponding `profileId`.
- [ ] Update `MatchingEngine` to be instantiated per profile or accept a profile object during scoring.

## 4. Frontend: Dashboard Integration
- [ ] Update `src/server/public/index.html`:
    - Add "Career Profiles" button to sidebar.
    - Create `#profiles-view` section with an upload form and a list of cards.
    - Add a profile switcher (dropdown) at the top of the discovery feed.
- [ ] Update `src/server/public/app.js`:
    - Implement `renderProfiles()` and `uploadProfile()`.
    - Update `fetchJobs()` to include profile filtering.
    - Update `openModal()` to show the matched profile name.

## 5. Verification
- [ ] Verify that multiple profiles can be created and stored.
- [ ] Verify that switching profiles in the sidebar updates the discovery feed.
- [ ] Verify that automation runs for all profiles and tags jobs correctly.
