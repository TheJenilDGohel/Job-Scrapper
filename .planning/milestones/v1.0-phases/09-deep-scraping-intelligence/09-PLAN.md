# Phase 9: Deep Scraping & Intelligence - Plan

## Goal
Extract full Job Descriptions (JD) and contact information (emails, company URLs) from matched job postings, and update the Web Dashboard to provide detailed views of these findings.

## Status
- [x] Backend extraction logic implemented in `BaseScraper`.
- [x] Database schema updated in `SqliteStorage`.
- [ ] Backend API fixed to return all data.
- [ ] Dashboard enhanced with modal and deep data display.

## Tasks

### 1. Fix Backend API Integration
- [ ] Update `src/server/index.js` to use `storage.getAllJobs()` instead of `storage.getAll()`.
- [ ] Verify `/api/jobs` returns the new fields (`jobDescription`, `contactEmail`, `companyUrl`).

### 2. Update Dashboard UI (CSS)
- [ ] Add modal styles to `src/server/public/style.css`.
- [ ] Add styling for JD content (markdown-like, scrollable).
- [ ] Add styling for contact details (pills or icons).

### 3. Update Dashboard Logic (JS)
- [ ] Update `src/server/public/app.js` to:
  - [ ] Add click event listeners to job cards.
  - [ ] Implement `openModal(job)` function.
  - [ ] Implement `closeModal()` function.
  - [ ] Update `renderJobs` to make cards clickable.
  - [ ] Format and display JD text in the modal.
  - [ ] Display company URL and contact emails in the modal.

### 4. Verification
- [ ] Run the server and verify jobs are displayed.
- [ ] Click a job card and verify the modal opens with detailed information.
- [ ] Verify search and filters still work.

## Verification Loop (UAT)
1. **API Check:** `curl http://localhost:3000/api/jobs` should return valid JSON with `jobDescription`.
2. **UI Check:** Clicking a card opens a modal.
3. **Data Check:** Modal displays "Contact Email" and "Company Website" if available.
