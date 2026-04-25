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
        status: job.status || 'discovered',
        profileId: job.profileId || null,
        updatedAt: new Date().toISOString()
      }, { onConflict: 'url' });

    if (error) {
      console.error('Error saving job to Supabase:', error);
      throw error;
    }
    return data;
  }

  // Profile Management
  async saveProfile(profile) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        ...profile,
        updatedAt: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async getProfiles() {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data;
  }

  async setDefaultProfile(id) {
    await this.supabase.from('profiles').update({ isDefault: false }).neq('id', id);
    const { error } = await this.supabase.from('profiles').update({ isDefault: true }).eq('id', id);
    return !error;
  }

  async deleteProfile(id) {
    const { error } = await this.supabase.from('profiles').delete().eq('id', id);
    return !error;
  }

  async updateJobStatus(id, status) {
    const { data, error } = await this.supabase
      .from('jobs')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating job status in Supabase:', error);
      throw error;
    }
    return true;
  }

  async save(job) {
    return this.saveJob(job);
  }

  async exists(url) {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('url')
      .eq('url', url)
      .maybeSingle(); 
    
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
    return data.map(j => ({
      ...j,
      status: j.status || 'discovered'
    }));
  }

  async getJobsMissingIntelligence(limit = 20) {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .or('jobDescription.is.null,jobDescription.eq."",contactEmail.is.null,contactEmail.eq.""')
      .limit(limit);

    if (error) {
      console.error('Error fetching jobs missing intelligence from Supabase:', error);
      throw error;
    }
    return data.map(j => ({
      ...j,
      status: j.status || 'discovered'
    }));
  }
}

module.exports = SupabaseStorage;
