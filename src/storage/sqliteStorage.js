const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class SqliteStorage {
  constructor(filename = 'jobs.db') {
    this.dbPath = path.join(__dirname, '../../data', filename);
    this.ensureDataDir();
    this.db = new Database(this.dbPath);
    this.initSchema();
  }

  ensureDataDir() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobTitle TEXT NOT NULL,
        company TEXT NOT NULL,
        url TEXT UNIQUE,
        score INTEGER,
        matchedSkills TEXT,
        location TEXT,
        source TEXT,
        jobDescription TEXT,
        contactEmail TEXT,
        companyUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add columns to existing table if they don't exist
    try { this.db.exec('ALTER TABLE jobs ADD COLUMN jobDescription TEXT'); } catch (e) {}
    try { this.db.exec('ALTER TABLE jobs ADD COLUMN contactEmail TEXT'); } catch (e) {}
    try { this.db.exec('ALTER TABLE jobs ADD COLUMN companyUrl TEXT'); } catch (e) {}
  }

  async saveJob(job) {
    const stmt = this.db.prepare(`
      INSERT INTO jobs (jobTitle, company, url, score, matchedSkills, location, source, jobDescription, contactEmail, companyUrl)
      VALUES (@jobTitle, @company, @url, @score, @matchedSkills, @location, @source, @jobDescription, @contactEmail, @companyUrl)
      ON CONFLICT(url) DO UPDATE SET
        score = excluded.score,
        matchedSkills = excluded.matchedSkills,
        jobDescription = COALESCE(excluded.jobDescription, jobs.jobDescription),
        contactEmail = COALESCE(excluded.contactEmail, jobs.contactEmail),
        companyUrl = COALESCE(excluded.companyUrl, jobs.companyUrl),
        updatedAt = CURRENT_TIMESTAMP
    `);

    try {
      stmt.run({
        ...job,
        matchedSkills: job.matchedSkills ? JSON.stringify(job.matchedSkills) : null,
        jobDescription: job.jobDescription || null,
        contactEmail: job.contactEmail || null,
        companyUrl: job.companyUrl || null
      });
      return job;
    } catch (err) {
      console.error('Error saving job to SQLite:', err);
      throw err;
    }
  }

  async save(job) {
    return this.saveJob(job);
  }

  exists(url) {
    const stmt = this.db.prepare('SELECT 1 FROM jobs WHERE url = ?');
    const row = stmt.get(url);
    return !!row;
  }
  async getAllJobs() {
    const stmt = this.db.prepare('SELECT * FROM jobs ORDER BY score DESC');
    const jobs = stmt.all();
    return jobs.map(j => ({
      ...j,
      matchedSkills: j.matchedSkills ? JSON.parse(j.matchedSkills) : []
    }));
  }
}

module.exports = SqliteStorage;
