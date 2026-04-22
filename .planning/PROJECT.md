# Local Job Discovery Engine

## Core Value
A Node.js-based local job discovery engine that automatically reads a CV, extracts skills/roles, aggregates jobs from multiple sources (LinkedIn public, Indeed, wellfound, career pages), and scores/ranks them, sending alerts.

## What This Is
A distributed, multi-source intelligence tool for job hunting. It uses smart aggregation rather than aggressive scraping.

## What This Is Not
- A tool that breaks limits or uses logged-in scraping aggressively (to avoid IP bans).
- A web app with complex user management (starts as a CLI/simple local tool).

## Target Audience
- Developers (initially the creator) looking for automated job hunting.

## Success Criteria
- Accurately parses PDF CVs.
- Aggregates jobs from multiple sources without getting blocked.
- Scores jobs intelligently based on skills/experience.
- Delivers ranked job matches via CLI, simple Dashboard, or Telegram alerts.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `pdf-parse` | Easy local CV parsing | Pending |
| Multi-source aggregation | Avoid aggressive scraping of single site to prevent bans | Pending |
| Node.js + Axios + Cheerio | Fast scraping | Pending |
| Puppeteer as fallback | Needed for JS-heavy pages | Pending |
| Storage: JSON then SQLite | Start simple, upgrade to SQLite when needed | Pending |

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] PDF CV Parsing (extract skills, roles, experience)
- [ ] Job Aggregator (LinkedIn public search, Indeed, Wellfound, Career pages)
- [ ] Scraper Engine (axios, cheerio, puppeteer, anti-block measures)
- [ ] Matching Engine (weighted scoring, keyword matching)
- [ ] Storage (JSON/SQLite)
- [ ] Output System (CLI / Dashboard / Telegram alerts)
- [ ] Automation (cron jobs)

### Out of Scope

- Resume auto-tailoring per job (deferred to later scaling)
- Cover letter generator (deferred to later scaling)
- Auto-apply (deferred to later scaling)

---
*Last updated: 2026-04-22 after initialization*
