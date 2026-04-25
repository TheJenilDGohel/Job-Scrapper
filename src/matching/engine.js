const Fuse = require('fuse.js');

class MatchingEngine {
  constructor(defaultProfile) {
    this.defaultProfile = defaultProfile; // { skills: [], roles: [], experience: 0 }
  }

  scoreJob(job, customProfile = null) {
    const profile = customProfile || this.defaultProfile;
    let score = 0;
    const matchedSkills = [];

    const jobTitleLower = job.jobTitle.toLowerCase();
    
    // Title match (0-30 points)
    let titleMatchScore = 0;
    const fuse = new Fuse(profile.roles, { includeScore: true });
    const result = fuse.search(jobTitleLower);
    if (result.length > 0) {
      titleMatchScore = (1 - result[0].score) * 30;
    } else {
      for (const role of profile.roles) {
        if (jobTitleLower.includes(role.toLowerCase())) {
          titleMatchScore = 20;
          break;
        }
      }
    }
    score += titleMatchScore;

    // Skills match (0-50 points)
    let skillScore = 0;
    const contentToSearch = (jobTitleLower + ' ' + (job.jobDescription || job.description || '').toLowerCase());
    
    if (profile.skills && profile.skills.length > 0) {
      const pointPerSkill = 50 / profile.skills.length;
      for (const skill of profile.skills) {
        if (contentToSearch.includes(skill.toLowerCase())) {
          skillScore += pointPerSkill;
          matchedSkills.push(skill);
        }
      }
    }
    score += skillScore;

    // Experience match (0-20 points)
    let experienceScore = 10;
    if (profile.experience < 3) {
      if (jobTitleLower.includes('senior') || jobTitleLower.includes('lead')) {
        experienceScore = 0;
      } else if (jobTitleLower.includes('junior') || jobTitleLower.includes('entry')) {
        experienceScore = 20;
      }
    } else {
      if (jobTitleLower.includes('senior') || jobTitleLower.includes('lead')) {
        experienceScore = 20;
      }
    }
    score += experienceScore;

    // Premium Boost: Flutter/Mobile Focus (User Mandate)
    if (jobTitleLower.includes('flutter') || jobTitleLower.includes('dart')) {
      score += 20; // Increased boost
    } else if (jobTitleLower.includes('mobile') || jobTitleLower.includes('ios') || jobTitleLower.includes('android')) {
      score += 10;
    }

    const finalScore = Math.min(100, Math.round(score));

    return {
      ...job,
      score: finalScore,
      matchedSkills
    };
  }

  rankJobs(jobs, profile = null) {
    const scoredJobs = jobs.map(job => this.scoreJob(job, profile));
    return scoredJobs.sort((a, b) => b.score - a.score);
  }
}

module.exports = MatchingEngine;
