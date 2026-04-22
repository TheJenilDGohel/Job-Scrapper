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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async saveJob(job) {
    const stmt = this.db.prepare(`
      INSERT INTO jobs (jobTitle, company, url, score, matchedSkills, location, source)
      VALUES (@jobTitle, @company, @url, @score, @matchedSkills, @location, @source)
      ON CONFLICT(url) DO UPDATE SET
        score = excluded.score,
        matchedSkills = excluded.matchedSkills,
        updatedAt = CURRENT_TIMESTAMP
    `);

    try {
      stmt.run({
        ...job,
        matchedSkills: job.matchedSkills ? JSON.stringify(job.matchedSkills) : null
      });
      return job;
    } catch (err) {
      console.error('Error saving job to SQLite:', err);
      throw err;
    }
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
