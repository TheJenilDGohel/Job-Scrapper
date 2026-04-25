# Phase 17: Chrome Extension (Discovery Lite)

## 🎯 Goal
Build a simple Chrome extension to allow users to "Save to Discovery" from any job site, enabling manual aggregation alongside autonomous scraping.

## 🛠️ Scope
- **Backend**: Add `POST /api/v1/internal/discovery/jobs` endpoint to save manual job entries.
- **Extension**:
    - `manifest.json`: Extension configuration.
    - `popup.html/js`: UI to edit/confirm job details before saving.
    - `content.js`: (Optional/Basic) Auto-extract title/company from known sites.
- **Security**: Extension must use the internal session token to authenticate with the local server.

## 📈 Success Criteria
- User can click the extension on a job page.
- Extension captures (or allows entry of) Title, Company, and URL.
- Job is saved to the local database and appears in the Discovery Feed.
