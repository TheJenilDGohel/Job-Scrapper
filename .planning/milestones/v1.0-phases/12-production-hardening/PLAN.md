# Phase 12 Plan: Production Hardening

## Goal
Harden the application for production by implementing security best practices, robust error handling, and deployment configurations.

## Tasks

### 1. Infrastructure & Dependencies
- [ ] Install production dependencies: `npm install helmet dotenv`
- [ ] Create a `.env.example` file to document required environment variables.

### 2. Server Security Hardening
- [ ] Update `src/server/index.js` to:
    - Load environment variables using `dotenv`.
    - Integrate `helmet` for secure headers.
    - Move `INTERNAL_SESSION_TOKEN` to environment variables.
    - Restrict CORS origin.
    - Add a simple request rate limiter (optional but recommended).

### 3. Scraper Robustness & Monitoring
- [ ] Update `src/scraper/baseScraper.js` to:
    - Implement a `fetchWithRetry` method with exponential backoff (handling 429 errors).
    - Add a file-based logger to record scraping results and errors.
    - Increase the variety of User-Agents.

### 4. Frontend Security & Polish
- [ ] Update `src/server/public/app.js` to:
    - Implement a lightweight HTML sanitizer for job descriptions.
    - Fetch the session token from a secure source (or at least move it to a non-obvious config).
- [ ] Add a "Production Ready" badge or version info to the dashboard.

### 5. Deployment Configuration
- [ ] Create `Procfile` for Railway/Heroku deployment.
- [ ] Create `docker-compose.yml` for VPS/Docker deployment.
- [ ] Update `package.json` with a `start` script if missing.

## Verification
- [ ] Verify server starts with secure headers (check via browser dev tools).
- [ ] Verify API returns 403 when session token is missing/incorrect from .env.
- [ ] Verify scraper retries on simulated 429 error.
- [ ] Verify deployment scripts are valid.
