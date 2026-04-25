# Phase 16 Plan: Resume Auto-Tailoring

## 1. CvParser Refactor
- [ ] Update `src/parser/cvParser.js`:
    - Constructor accepts `filepath`.
    - `parse()` method reads PDF and stores `this.rawText`.
    - Return profile as before.
    - Export `getRawText()`.

## 2. Gemini Service Implementation
- [ ] Create `src/tailoring/tailorService.js`:
    - Initialize `@google/generative-ai` with `GEMINI_API_KEY`.
    - Implement `generateSuggestions(resumeText, jobDescription)`.
    - Use a structured prompt to get bullet point suggestions.

## 3. Backend API
- [ ] Update `src/server/index.js`:
    - Initialize `CvParser` and `TailorService`.
    - Add `POST /api/v1/internal/discovery/jobs/:id/tailor` endpoint.
    - Endpoint flow:
        1. Fetch job by ID.
        2. Parse CV (if not already parsed).
        3. Call `TailorService` with CV text and JD.
        4. Return suggestions.

## 4. Frontend Integration
- [ ] Update `src/server/public/index.html`:
    - Add a container for tailoring results in the modal or a new modal.
- [ ] Update `src/server/public/style.css`:
    - Add styles for tailoring suggestions (e.g., "Change this" -> "To this").
- [ ] Update `src/server/public/app.js`:
    - Add `tailorResume(jobId)` function.
    - Update `openModal` to include the "Tailor My Resume" button.
    - Handle displaying the results.

## 5. Verification
- [ ] Verify that the CV is correctly parsed and text is available.
- [ ] Verify that Gemini API is called with correct prompt.
- [ ] Verify that suggestions are displayed correctly in the UI.
