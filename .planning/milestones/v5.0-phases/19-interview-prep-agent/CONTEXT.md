# Phase 19: Interview Prep Agent

## 🎯 Goal
Integrate Gemini API to generate tailored interview practice questions and preparation strategies based on the Job Description and the candidate's resume.

## 🛠️ Scope
- **Service**: Implement `PrepService` to interface with Google Gemini.
- **Backend**: Add `POST /api/v1/internal/discovery/jobs/:id/prep` endpoint.
- **Frontend**:
    - Add "Interview Prep" button in Job Modal.
    - Create a dedicated section/modal for prep materials (Questions, Behavioral Tips, Tech Focus areas).
    - Handle loading and display states.

## 📈 Success Criteria
- User can trigger a preparation analysis for any job.
- System provides at least 5 tailored technical and behavioral questions.
- Prep materials are relevant to both the JD and the candidate's specific profile.
