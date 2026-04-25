# Phase 19 Plan: Interview Prep Agent

## 1. Gemini Service Implementation
- [ ] Create `src/tailoring/prepService.js`:
    - Implement `generatePrepMaterial(resumeText, jobDescription)`.
    - Request: Technical questions, Behavioral questions, and "Key focus areas" for this specific company/role.

## 2. Backend API
- [ ] Update `src/server/index.js`:
    - Initialize `PrepService`.
    - Add `POST /api/v1/internal/discovery/jobs/:id/prep` endpoint.
    - Flow: Fetch job -> Get CV Text -> Call AI -> Return JSON.

## 3. Frontend Integration
- [ ] Update `src/server/public/style.css`:
    - Add styles for the prep container (cards for questions, bullet points for tips).
- [ ] Update `src/server/public/app.js`:
    - Add `generateInterviewPrep(jobId)` function.
    - Update `openModal` to include the "Prepare for Interview" button.
    - Handle results display.

## 4. Verification
- [ ] Verify AI generates job-specific questions.
- [ ] Verify results are displayed clearly in the UI.
