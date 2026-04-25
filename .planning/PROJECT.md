# Local Job Discovery Engine

## Core Value
A Node.js-based local job discovery engine that automatically reads a CV, extracts skills/roles, aggregates jobs from multiple sources, and scores/ranks them for a premium dashboard experience.
**Crucially, this platform is architected to be Zero-Dependency and Local-First**, ensuring 100% production uptime by eliminating reliance on third-party cloud databases or paid APIs for core functionality.

## 🏁 Current State (v1.1)
- **Status**: Shipped & Production Ready (Local-First).
- **Key Tech**: Node.js, Express, SQLite, Puppeteer, Discord (Optional).
- **Archive**: [v4.0-MILESTONE-AUDIT.md](milestones/v4.0-MILESTONE-AUDIT.md)

## 🎯 Next Milestone Goals
- Future roadmap planning (Market Expansion, Multi-Profile support, Analytics).

## Key Decisions (v1.1)
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Zero-Dependency Architecture | Eliminate production "issues" caused by third-party service limits/downtime/billing | Verified |
| SQLite Primary Storage | Zero-cost, zero-latency, full ownership of data | Implemented |
| Local CV Intelligence | No data leaves the user's machine during parsing | Verified |
| Local-First Notifications | System works even without an internet connection (via console/logs) | Implemented |
| Optional AI Layer | Premium features (Tailoring) are available but not required for core operation | Implemented |
| Glassmorphism UI | Premium aesthetic for developer-centric UX | Delivered |

## Requirements

### Validated (v1.1)
- [x] PDF CV Parsing & Profile Extraction
- [x] Multi-Source Job Scraper (LinkedIn, Wellfound)
- [x] Weighted Matching Engine (Skills/Roles/Exp)
- [x] Hybrid Storage (Local SQLite + Cloud Supabase)
- [x] Hourly Background Automation
- [x] Premium Dashboard with Command Center
- [x] Application Tracking (Kanban)
- [x] AI Resume Tailoring (Gemini)
- [x] Browser Native Discovery (Chrome Extension)

### Active
(Ideating Milestone 5)

---
*Last updated: 2026-04-25 after v1.1 Release*
