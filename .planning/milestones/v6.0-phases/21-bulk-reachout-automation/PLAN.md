# Phase 21 Plan: Bulk Reachout Automation

## 1. AI Email Draft Service
- [ ] Create `src/tailoring/emailDraftService.js`:
    - Implement `generateDraft(resumeText, jobDescription, contactEmail, company, jobTitle)`.
    - Instruct Gemini to find the recruiter's name from the JD if possible, and draft a cold email highlighting overlapping skills.

## 2. Backend API
- [ ] Update `src/server/index.js`:
    - Add `POST /api/v1/internal/discovery/jobs/:id/draft-email` endpoint.
    - Connect the request to `EmailDraftService`.

## 3. Frontend Integration
- [ ] Update `src/server/public/style.css`:
    - Add styling for the email draft section (textbox, copy button, mailto action).
- [ ] Update `src/server/public/app.js`:
    - Add `draftEmail(jobId)` function.
    - Update `openModal` to inject the new button and a hidden container for the draft.
    - Add a copy-to-clipboard handler for the drafted text.

## 4. Verification
- [ ] Verify Gemini generates a valid, properly formatted email draft.
- [ ] Verify the copy button and `mailto:` action function correctly within the modal UI.
