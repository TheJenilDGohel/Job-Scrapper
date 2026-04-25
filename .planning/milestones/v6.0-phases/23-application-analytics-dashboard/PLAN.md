# Phase 23 Plan: Application Analytics Dashboard

## 1. Backend API Implementation
- [ ] Update `src/server/index.js`:
    - Add `GET /api/v1/internal/analytics/summary` endpoint.
    - Logic:
        1. Fetch all jobs.
        2. Calculate counts by status.
        3. Calculate counts by source.
        4. Calculate match score buckets (0-40, 40-75, 75+).
        5. Return aggregated JSON.

## 2. Frontend: UI Structure
- [ ] Update `src/server/public/index.html`:
    - Add "Search Analytics" button to sidebar.
    - Add a container section for the analytics view (`#analytics-view`).
    - Define placeholders for charts (Funnel, Source Pie, Match Score Bars).

## 3. Frontend: Logic & Visualization
- [ ] Update `src/server/public/app.js`:
    - Implement `renderAnalytics()` function.
    - Add logic to fetch data from the new analytics endpoint.
    - Implement simple SVG-based bar and pie charts to maintain zero external library dependency (keeping it lightweight and free).
    - Ensure view-switching logic handles the transition to the analytics view.

## 4. Frontend: Styling
- [ ] Update `src/server/public/style.css`:
    - Add styles for analytics cards and chart containers.
    - Animate chart entry for a premium feel.

## 5. Verification
- [ ] Verify that the analytics dashboard accurately reflects the database state.
- [ ] Verify that the charts are responsive and visually consistent with the Glassmorphism brand.
