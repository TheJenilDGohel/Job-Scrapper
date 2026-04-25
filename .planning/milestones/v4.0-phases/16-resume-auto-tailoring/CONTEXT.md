# Phase 16: Resume Auto-Tailoring

## 🎯 Goal
Integrate Gemini API to suggest resume bullet point changes based on the Job Description of a discovered job.

## 🛠️ Scope
- **CvParser**: Refactor to store raw text of the CV.
- **Service**: Create `TailorService` to interface with Google Gemini.
- **Backend**: Add `POST /api/v1/internal/discovery/jobs/:id/tailor` endpoint.
- **Frontend**:
    - Add "Tailor My Resume" button in Job Modal.
    - Display AI suggestions in a clear, actionable format.
    - Handle loading and error states for AI generation.

## 📈 Success Criteria
- User can trigger a tailoring analysis for any job.
- System provides specific bullet point suggestions or highlights missing keywords.
- Suggestions are relevant to the Job Description.
