# Phase 12 Context: Production Hardening

## Domain Boundary
Securing the job discovery engine, hardening the server, and improving scraper robustness for production deployment.

## Decisions

### 1. Authentication & API Security
- **Decision**: Move the internal session token to an environment variable (`INTERNAL_SESSION_TOKEN`).
- **Decision**: Implement `helmet` for secure HTTP headers.
- **Decision**: Restrict CORS to a whitelist (initially allow local and a placeholder production domain).
- **Decision**: Use a more robust token check middleware.

### 2. Scraper Robustness
- **Decision**: Implement a retry mechanism with exponential backoff for 429 (Too Many Requests) errors.
- **Decision**: Add a dedicated logger (`logs/scraper.log`) to track scraping success/failure.
- **Decision**: Expand the User-Agent pool and rotate them more intelligently.

### 3. Frontend Security
- **Decision**: Implement basic HTML sanitization for job descriptions using a library like `dompurify` (or a lightweight regex-based equivalent if avoiding new dependencies).
- **Decision**: Externalize the session token from the hardcoded JS (load via environment or config).

### 4. Deployment
- **Decision**: Create a `Procfile` for Railway/Heroku.
- **Decision**: Create a `docker-compose.yml` for VPS deployment.
- **Decision**: Add a `HEALTHCHECK` endpoint or integrate with the existing `/ping`.

## Deferred Ideas
- Proxy rotation (too complex for v1.0).
- Full OAuth2 integration (sticking with session tokens for simplicity in v1.0).

## Canonical Refs
- [PROJECT.md](../../PROJECT.md)
- [src/server/index.js](../../src/server/index.js)
- [src/scraper/baseScraper.js](../../src/scraper/baseScraper.js)
