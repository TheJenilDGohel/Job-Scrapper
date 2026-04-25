# Phase 24: Multi-CV & Profile Management

## 🎯 Goal
Allow users to upload, manage, and toggle between multiple CVs (e.g., Frontend vs. Mobile vs. Backend), enabling the engine to perform targeted discovery and matching for different career paths simultaneously.

## 🛠️ Scope
- **Storage**:
    - Create a `profiles` table to store structured metadata for different CVs.
    - Add `profileId` to the `jobs` table to associate discoveries with specific career profiles.
- **Backend**:
    - Add endpoints for uploading new PDFs and managing profile metadata.
    - Update `MatchingEngine` to handle multi-profile scoring.
- **Frontend**:
    - Add a "Profiles" management section in the dashboard.
    - Add a profile selector in the sidebar to toggle the active discovery view.
    - Display which profile a job was matched against in the grid and modal.

## 📈 Success Criteria
- User can upload more than one CV.
- System identifies and tags jobs based on which profile they matched best.
- Dashboard can filter discoveries based on the active career profile.
