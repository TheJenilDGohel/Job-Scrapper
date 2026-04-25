# Phase 15: Application Tracker

## 🎯 Goal
Implement a kanban board/status tracker for applied jobs and link jobs from "Discovered" to "Applied".

## 🛠️ Scope
- **Storage**: Add `status` field to `jobs` table (SQLite & Supabase).
- **Backend**: Add API endpoint `PATCH /api/v1/internal/discovery/jobs/:id/status`.
- **Frontend**:
    - Add "Move to Applied" action in Job Modal.
    - Create a Kanban board view showing stages: Discovered, Applied, Interviewing, Offer/Rejected.
    - Add Sidebar navigation to switch between "Discovery" and "Application Tracker".

## 📈 Success Criteria
- User can move a discovered job to "Applied" status.
- Applied jobs appear in a separate Kanban board view.
- Status changes are persisted in the database.
