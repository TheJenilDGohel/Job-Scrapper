const fs = require('fs');
const path = require('path');

class JsonStorage {
  constructor(filename = 'jobs.json') {
    this.filepath = path.join(__dirname, '../../data', filename);
    this.ensureDataDir();
  }

  ensureDataDir() {
    const dir = path.dirname(this.filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filepath)) {
      fs.writeFileSync(this.filepath, JSON.stringify([]));
    }
  }

  async saveJob(job) {
    const jobs = await this.getAllJobs();
    
    // Check for duplicates
    const existingIndex = jobs.findIndex(j => 
      j.url === job.url || (j.company === job.company && j.jobTitle === job.jobTitle)
    );

    if (existingIndex !== -1) {
      jobs[existingIndex] = { ...jobs[existingIndex], ...job, updatedAt: new Date().toISOString() };
    } else {
      job.createdAt = new Date().toISOString();
      jobs.push(job);
    }

    fs.writeFileSync(this.filepath, JSON.stringify(jobs, null, 2));
    return job;
  }

  async getAllJobs() {
    try {
      const data = fs.readFileSync(this.filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading JSON storage:', error);
      return [];
    }
  }
}

module.exports = JsonStorage;
