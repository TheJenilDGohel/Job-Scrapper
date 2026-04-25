# Phase 17 Plan: Chrome Extension (Discovery Lite)

## 1. Backend API Expansion
- [ ] Update `src/server/index.js`:
    - Add `POST /api/v1/internal/discovery/jobs` endpoint.
    - Logic:
        1. Receive job details (title, company, url, description, etc.).
        2. Assign a default score (e.g., 50 or re-calculate if profile available).
        3. Save to storage with `source: 'extension'`.
- [ ] Update CORS policy to allow requests from extension (chrome-extension://).

## 2. Extension Development
- [ ] Create `extension/` directory.
- [ ] Create `extension/manifest.json` (Manifest V3).
- [ ] Create `extension/popup.html`:
    - Form with fields: Title, Company, URL, Description.
    - "Save to Discovery" button.
- [ ] Create `extension/popup.js`:
    - Get current tab URL.
    - Send data to local server.
    - Handle success/error feedback.
- [ ] Create `extension/content.js`:
    - Basic logic to scrape title/company from LinkedIn/Wellfound if on those pages.

## 3. Verification
- [ ] Verify that the new API endpoint saves jobs correctly.
- [ ] Verify that the extension can communicate with the local server.
- [ ] Verify that jobs saved via extension appear in the dashboard with the 'extension' source.
