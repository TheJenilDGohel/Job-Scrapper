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
    // Career Profiles Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        roles TEXT,
        skills TEXT,
        experience INTEGER,
        cvText TEXT,
        isDefault INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
        status TEXT DEFAULT 'discovered',
        profileId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(profileId) REFERENCES profiles(id)
      )
    `);

    // Add columns to existing table if they don't exist
    try { this.db.exec('ALTER TABLE jobs ADD COLUMN jobDescription TEXT'); } catch (e) {}
    try { this.db.exec('ALTER TABLE jobs ADD COLUMN contactEmail TEXT'); } catch (e) {}
    try { this.db.exec('ALTER TABLE jobs ADD COLUMN companyUrl TEXT'); } catch (e) {}
    try { this.db.exec("ALTER TABLE jobs ADD COLUMN status TEXT DEFAULT 'discovered'"); } catch (e) {}
    try { this.db.exec("ALTER TABLE jobs ADD COLUMN profileId INTEGER"); } catch (e) {}
  }

  // Profile Management
  async saveProfile(profile) {
    const stmt = this.db.prepare(`
      INSERT INTO profiles (name, roles, skills, experience, cvText, isDefault)
      VALUES (@name, @roles, @skills, @experience, @cvText, @isDefault)
    `);
    
    try {
      const result = stmt.run({
        ...profile,
        roles: JSON.stringify(profile.roles || []),
        skills: JSON.stringify(profile.skills || []),
        isDefault: profile.isDefault ? 1 : 0
      });
      return result.lastInsertRowid;
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  }

  async getProfiles() {
    const stmt = this.db.prepare('SELECT * FROM profiles ORDER BY createdAt DESC');
    const profiles = stmt.all();
    return profiles.map(p => ({
      ...p,
      roles: JSON.parse(p.roles || '[]'),
      skills: JSON.parse(p.skills || '[]'),
      isDefault: !!p.isDefault
    }));
  }

  async setDefaultProfile(id) {
    this.db.prepare('UPDATE profiles SET isDefault = 0').run();
    const stmt = this.db.prepare('UPDATE profiles SET isDefault = 1 WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  async deleteProfile(id) {
    return this.db.prepare('DELETE FROM profiles WHERE id = ?').run(id).changes > 0;
  }

  async saveJob(job) {
    const stmt = this.db.prepare(`
      INSERT INTO jobs (jobTitle, company, url, score, matchedSkills, location, source, jobDescription, contactEmail, companyUrl, status, profileId)
      VALUES (@jobTitle, @company, @url, @score, @matchedSkills, @location, @source, @jobDescription, @contactEmail, @companyUrl, @status, @profileId)
      ON CONFLICT(url) DO UPDATE SET
        score = excluded.score,
        matchedSkills = excluded.matchedSkills,
        jobDescription = COALESCE(excluded.jobDescription, jobs.jobDescription),
        contactEmail = COALESCE(excluded.contactEmail, jobs.contactEmail),
        companyUrl = COALESCE(excluded.companyUrl, jobs.companyUrl),
        profileId = COALESCE(excluded.profileId, jobs.profileId),
        updatedAt = CURRENT_TIMESTAMP
    `);

    try {
      stmt.run({
        ...job,
        matchedSkills: job.matchedSkills ? JSON.stringify(job.matchedSkills) : null,
        jobDescription: job.jobDescription || null,
        contactEmail: job.contactEmail || null,
        companyUrl: job.companyUrl || null,
        status: job.status || 'discovered',
        profileId: job.profileId || null
      });
      return job;
    } catch (err) {
      console.error('Error saving job to SQLite:', err);
      throw err;
    }
  }

  async updateJobStatus(id, status) {
    const stmt = this.db.prepare('UPDATE jobs SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    try {
      const result = stmt.run(status, id);
      return result.changes > 0;
    } catch (err) {
      console.error('Error updating job status in SQLite:', err);
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
      matchedSkills: j.matchedSkills ? JSON.parse(j.matchedSkills) : [],
      status: j.status || 'discovered'
    }));
  }

  async getJobsMissingIntelligence(limit = 20) {
    const stmt = this.db.prepare(`
      SELECT * FROM jobs 
      WHERE (jobDescription IS NULL OR jobDescription = '') 
      AND (contactEmail IS NULL OR contactEmail = '')
      LIMIT ?
    `);
    const jobs = stmt.all(limit);
    return jobs.map(j => ({
      ...j,
      matchedSkills: j.matchedSkills ? JSON.parse(j.matchedSkills) : [],
      status: j.status || 'discovered'
    }));
  }

  async getJobsMissingEmail(limit = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM jobs 
      WHERE (contactEmail IS NULL OR contactEmail = '')
      LIMIT ?
    `);
    const jobs = stmt.all(limit);
    return jobs.map(j => ({
      ...j,
      matchedSkills: j.matchedSkills ? JSON.parse(j.matchedSkills) : [],
      status: j.status || 'discovered'
    }));
  }
}

module.exports = SqliteStorage;
