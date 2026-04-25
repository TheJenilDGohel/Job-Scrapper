class NotificationService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  }

  async notify(jobs) {
    if (!jobs || jobs.length === 0) return;

    // Log to console - Always free and reliable
    console.log(`\n🔔 [Notification] Found ${jobs.length} relevant opportunities:`);
    jobs.slice(0, 10).forEach(j => {
      console.log(`   - ${j.jobTitle} @ ${j.company} [Match: ${j.score}%]`);
    });

    // Optional third-party webhook (Discord)
    if (this.webhookUrl) {
      const axios = require('axios');
      try {
        const embeds = jobs.slice(0, 5).map(job => ({
          title: job.jobTitle,
          url: job.url,
          description: `**Company:** ${job.company}\n**Score:** ${job.score}%\n**Location:** ${job.location || 'Remote'}`,
          color: 3447003
        }));

        await axios.post(this.webhookUrl, {
          content: `🚀 **Job Discovery Update**: Found ${jobs.length} new matches!`,
          embeds
        });
        console.log('✅ Webhook notification dispatched.');
      } catch (err) {
        console.error('⚠️ Webhook failed:', err.message);
      }
    } else {
      console.log('💡 Tip: Set DISCORD_WEBHOOK_URL in .env to receive these alerts on Discord.');
    }
  }
}

module.exports = NotificationService;
