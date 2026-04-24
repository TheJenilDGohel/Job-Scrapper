const Fuse = require('fuse.js');

class MatchingEngine {
  constructor(userProfile) {
    this.userProfile = userProfile; // { skills: [], roles: [], experience: 0 }
  }

  scoreJob(job) {
    let score = 0;
    const matchedSkills = [];

    const jobTitleLower = job.jobTitle.toLowerCase();
    
    // Title match (0-30 points)
    let titleMatchScore = 0;
    const fuse = new Fuse(this.userProfile.roles, { includeScore: true });
    const result = fuse.search(jobTitleLower);
    if (result.length > 0) {
      // 1 - score because lower score is better in Fuse (0 is exact match)
      titleMatchScore = (1 - result[0].score) * 30;
    } else {
      // Fallback simple includes
      for (const role of this.userProfile.roles) {
        if (jobTitleLower.includes(role.toLowerCase())) {
          titleMatchScore = 20; // good partial match
          break;
        }
      }
    }
    score += titleMatchScore;

    // Skills match (0-50 points)
    // We assume the scraped job hasn't parsed skills yet, so we search the title for now
    // In a real scenario, we'd scrape the job description and search that.
    let skillScore = 0;
    const contentToSearch = (jobTitleLower + ' ' + (job.description || '').toLowerCase());
    
    if (this.userProfile.skills && this.userProfile.skills.length > 0) {
      const pointPerSkill = 50 / this.userProfile.skills.length;
      for (const skill of this.userProfile.skills) {
        if (contentToSearch.includes(skill.toLowerCase())) {
          skillScore += pointPerSkill;
          matchedSkills.push(skill);
        }
      }
    }
    score += skillScore;

    // Experience match (0-20 points)
    // Basic heuristic: check if "senior" is in title when exp < 3
    let experienceScore = 10; // base score
    if (this.userProfile.experience < 3) {
      if (jobTitleLower.includes('senior') || jobTitleLower.includes('lead')) {
        experienceScore = 0; // Negative indicator for juniors
      } else if (jobTitleLower.includes('junior') || jobTitleLower.includes('entry')) {
        experienceScore = 20; // Perfect match for juniors
      }
    } else {
      if (jobTitleLower.includes('senior') || jobTitleLower.includes('lead')) {
        experienceScore = 20;
      }
    }
    score += experienceScore;

    // Premium Boost: Flutter/Mobile Focus (User Request)
    if (jobTitleLower.includes('flutter') || jobTitleLower.includes('dart')) {
      score += 15;
    } else if (jobTitleLower.includes('mobile') || jobTitleLower.includes('ios') || jobTitleLower.includes('android')) {
      score += 10;
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.round(score));

    return {
      ...job,
      score: finalScore,
      matchedSkills
    };
  }

  rankJobs(jobs) {
    const scoredJobs = jobs.map(job => this.scoreJob(job));
    return scoredJobs.sort((a, b) => b.score - a.score);
  }
}

module.exports = MatchingEngine;
