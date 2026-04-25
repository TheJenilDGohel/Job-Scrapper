# Phase 15 Plan: Application Tracker

## 1. Storage & Schema Update
- [ ] Update `src/storage/sqliteStorage.js`:
    - Add `status` column to `jobs` table in `initSchema`.
    - Handle `status` in `saveJob` and `getAllJobs`.
    - Add `updateJobStatus(id, status)` method.
- [ ] Update `src/storage/supabaseStorage.js`:
    - Update `saveJob` and `getAllJobs` to include `status`.
    - Add `updateJobStatus(id, status)` method.

## 2. API Implementation
- [ ] Update `src/server/index.js`:
    - Add `PATCH /api/v1/internal/discovery/jobs/:id/status` endpoint.
    - Ensure it uses the session token for security.

## 3. Frontend: Dashboard Integration
- [ ] Update `src/server/public/index.html`:
    - Add "Application Tracker" button to sidebar.
    - Add a container for the Kanban board view.
- [ ] Update `src/server/public/style.css`:
    - Add styles for the Kanban board (columns, cards).
    - Add styles for the "Applied" status badge.
- [ ] Update `src/server/public/app.js`:
    - Implement state management for the current view (Discovery vs. Tracker).
    - Add logic to render the Kanban board.
    - Add `updateJobStatus` function to call the backend API.
    - Add "Move to Applied" button logic in `openModal`.

## 4. Verification
- [ ] Verify that new jobs are created with 'discovered' status.
- [ ] Verify that clicking "Move to Applied" updates the status in the DB.
- [ ] Verify that the Kanban board correctly displays jobs in their respective columns.
