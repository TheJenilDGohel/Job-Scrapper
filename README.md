# 🚀 Autonomous Job Discovery Engine v1.1


> **Autonomous Intelligence for the Modern Developer.** 
> This engine doesn't just scrape; it analyzes, scores, and delivers high-fidelity job opportunities for **Mobile & Flutter** roles directly to your Command Center and Discord.

## 🌟 Key Updates in v1.1
- **Deep Discovery Depth**: Increased LinkedIn search depth to 4 pages per role (100+ jobs) to ensure 24/7 volume.
- **Flutter & Mobile Intelligence**: Enhanced matching engine with specialized scoring boosts for Dart, Flutter, and Mobile platforms.
- **Smart Notification Tiering**: Discord alerts are now strictly scoped to high-matching roles (70%+) or relevant Mobile/Flutter positions (50%+).
- **Stabilized Command Center**: Fixed layout regressions and overflow issues for a seamless dashboard experience on all screen sizes.

## 🧠 Core Features

*   **🧠 CV Intelligence**: Automatically parses PDF resumes and builds a structured skill/role profile.
*   **🕷️ Autonomous Crawling**: Multi-source scraping (LinkedIn, Wellfound, etc.) with anti-blocking logic.
*   **📊 Smart Matching**: Weighted scoring engine (50% skills, 30% roles, 20% experience).
*   **💎 Premium Dashboard**: Glassmorphism UI with micro-animations and real-time job analytics.
*   **🛡️ Production Hardened**: Security headers, rate-limit retries, and HTML sanitization.
*   **🔔 Intelligent Alerts**: Discord notifications for high-matching opportunities.

---

## 🛠️ Tech Stack

- **Core**: Node.js, Express.js
- **Intelligence**: Cheerio, Puppeteer, fuse.js
- **Storage**: Supabase (Cloud) / Better-SQLite3 (Local)
- **UI**: Vanilla CSS (Glassmorphism), Outfit Font
- **DevOps**: Docker, Procfile (Railway/Heroku Ready)

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/TheJenilDGohel/Job-Scrapper.git
cd Job-Scrapper
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Populate your Supabase credentials and Discord webhook URL.

### 4. Initialize Database
If using Supabase, ensure the `jobs` table is created:
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_title TEXT,
  company TEXT,
  url TEXT UNIQUE,
  score FLOAT,
  matched_skills TEXT[],
  location TEXT,
  source TEXT,
  job_description TEXT,
  contact_email TEXT,
  company_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🏃 Execution

### 🖥️ Dashboard (Web)
Launch the premium web interface:
```bash
npm run dashboard
```
Accessible at `http://localhost:3000`. Use the `INTERNAL_SESSION_TOKEN` for API access.

### ⌨️ CLI (Manual Run)
Run the scraping pipeline manually:
```bash
npm run cli -- --location "India"
```

### ⏰ Automation (Cron)
Start the background worker (runs every 1 hour):
```bash
npm run cron
```

---

## 🐳 Docker Deployment

Deploy the entire stack with one command:
```bash
docker-compose up -d --build
```

---

## ☁️ 24/7 Cloud Deployment (Free)

### 1. Scraper Automation (GitHub Actions)
The scraper is configured to run every hour automatically via GitHub Actions. This keeps your Supabase database active (preventing it from pausing due to inactivity) and ensures your job list is always fresh.

1. Push this code to a **GitHub Repository**.
2. Go to **Settings > Secrets and Variables > Actions**.
3. Add the following **New repository secrets**:
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_KEY`: Your Supabase Service Role/Anon Key.
   - `DISCORD_WEBHOOK_URL`: The Discord webhook URL.
   - `INTERNAL_SESSION_TOKEN`: `job-discovery-secure-2026`.

### 2. Dashboard Hosting (Render.com)
1. Create a new **Web Service** on Render.
2. Link your GitHub repo.
3. Select **Environment: Node**.
4. Set **Build Command**: `npm install`.
5. Set **Start Command**: `npm start`.
6. Add the same secrets to Render's **Environment Variables** section.

---

## 🛡️ Security Note

This application is **Production Hardened**.
- **Rate Limiting**: Integrated exponential backoff for scraper stability.
- **Headers**: Secure HTTP headers via Helmet.js.
- **XSS**: Strict HTML sanitization on all scraped content.
- **Access**: Obfuscated API endpoints and token-based protection.

---

## 📜 License

ISC License. Built with ❤️ for autonomous career growth.
