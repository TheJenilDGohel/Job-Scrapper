# Phase 23: Application Analytics Dashboard

## 🎯 Goal
Implement a visual analytics dashboard to provide insights into the job search progress, matching performance, and market trends based on aggregated data.

## 🛠️ Scope
- **UI**:
    - Add an "Analytics" button to the sidebar navigation.
    - Create a dashboard view with visual charts and stats.
    - Charts to include: Application Funnel (Discovered -> Applied -> Interviewing -> Offered), Source Distribution (LinkedIn vs Indeed etc.), and Match Score Distribution.
- **Backend**:
    - Add `/api/v1/internal/analytics/summary` endpoint to calculate stats from the database.
- **Frontend**:
    - Integrate a lightweight charting library (or pure CSS/SVG bars for zero-dependency) to visualize the data.
    - Implement the analytics rendering logic in `app.js`.

## 📈 Success Criteria
- User can view a high-level summary of their job search progress.
- Visual breakdown of job sources and matching tiers.
- Key metrics (Avg match score, Total discoveries, Application conversion rate) are clearly displayed.
