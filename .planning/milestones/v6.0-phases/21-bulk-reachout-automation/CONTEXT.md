# Phase 21: Bulk Reachout Automation (Email drafting)

## 🎯 Goal
Leverage Google Gemini to analyze the job description, extract the recruiter's name (if present), infer or utilize their email address (from our enhanced regex scraper), and draft a highly personalized cold-outreach email tailored to the candidate's CV and the job's specific requirements.

## 🛠️ Scope
- **Backend Service**: Create an `EmailDraftService` that wraps Gemini to generate cold email drafts.
- **API Endpoint**: Add `POST /api/v1/internal/discovery/jobs/:id/draft-email`.
- **Scraper Enhancement**: We already upgraded `baseScraper.js` with advanced regex for obfuscated emails (e.g., "name [at] domain dot com").
- **UI/UX**: 
    - Add a "Draft Outreach Email" button to the Job Modal (next to Interview Prep).
    - Display the drafted email in a new section within the modal, complete with a "Copy to Clipboard" button and a direct `mailto:` link if an email is available.
- **AI Prompting**: Instruct Gemini to figure out the likely recruiter name from the text and suggest a professional, concise email subject and body.

## 📈 Success Criteria
- User clicks "Draft Outreach Email" and receives a customized, professional draft.
- The draft automatically inserts the candidate's core strengths that align with the JD.
- A `mailto:` link is generated to quickly open the user's default email client.
