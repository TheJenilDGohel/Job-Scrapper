const axios = require('axios');

class NotificationService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL; // Using discord as preferred by user
  }

  async notify(jobs) {
    if (!jobs || jobs.length === 0) return;
    if (!this.webhookUrl) {
      console.log('No webhook URL configured. Skipping notifications.');
      return;
    }

    try {
      const embeds = jobs.slice(0, 5).map(job => ({
        title: job.jobTitle,
        url: job.jobUrl,
        description: `**Company:** ${job.company}\n**Score:** ${job.score}\n**Location:** ${job.location}`,
        color: 3447003
      }));

      await axios.post(this.webhookUrl, {
        content: `Found ${jobs.length} new high-matching jobs!`,
        embeds
      });
      console.log('Notifications sent successfully.');
    } catch (err) {
      console.error('Failed to send notifications:', err.message);
    }
  }
}

module.exports = NotificationService;
