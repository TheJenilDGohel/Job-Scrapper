const { createClient } = require('@supabase/supabase-js');

class SupabaseStorage {
  constructor(url, key) {
    this.supabase = createClient(url, key);
  }

  async saveJob(job) {
    const { data, error } = await this.supabase
      .from('jobs')
      .upsert({
        jobTitle: job.jobTitle,
        company: job.company,
        url: job.url,
        score: job.score,
        matchedSkills: job.matchedSkills,
        location: job.location,
        source: job.source,
        jobDescription: job.jobDescription,
        contactEmail: job.contactEmail,
        companyUrl: job.companyUrl,
        updatedAt: new Date().toISOString()
      }, { onConflict: 'url' });

    if (error) {
      console.error('Error saving job to Supabase:', error);
      throw error;
    }
    return data;
  }

  async save(job) {
    return this.saveJob(job);
  }

  async exists(url) {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('url')
      .eq('url', url)
      .maybeSingle(); // maybeSingle returns null if no rows instead of error
    
    if (error) {
      console.error('Error checking job existence in Supabase:', error);
    }
    return !!data;
  }

  async getAllJobs() {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching jobs from Supabase:', error);
      throw error;
    }
    return data;
  }
}

module.exports = SupabaseStorage;
