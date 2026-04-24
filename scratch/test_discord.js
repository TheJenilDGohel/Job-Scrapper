require('dotenv').config();
const NotificationService = require('../src/notifications/index');

async function testNotification() {
  const notifier = new NotificationService();
  const testJobs = [
    {
      jobTitle: "🔍 Test Connection: Job Discovery Engine",
      company: "System Intelligence",
      score: 99,
      location: "Cloud",
      jobUrl: "http://localhost:3000"
    }
  ];
  
  console.log('Sending test notification to Discord...');
  await notifier.notify(testJobs);
  console.log('Done.');
}

testNotification();
