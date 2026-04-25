const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const LOG_FILE = path.join(process.cwd(), 'logs', 'cron-status.log');

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function logToDashboard(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${level}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, entry);
  console.log(message);
}

console.log(chalk.blue('=== Starting Background Job Scraper & Recovery Service ==='));
console.log('Main Scrape: Every 1 hour');
console.log('Recovery/Enrichment: Every 2 hours');

const runScrape = () => {
  logToDashboard('🚀 Triggering scheduled scrape cycle (All Profiles)...', 'SCRAPE');
  const cliPath = path.join(__dirname, '../cli/index.js');
  
  exec(`node "${cliPath}" run`, (error, stdout, stderr) => {
    if (error) {
      logToDashboard(`❌ Scrape Error: ${error.message}`, 'ERROR');
      return;
    }
    logToDashboard('✅ Multi-profile scrape cycle completed.');
  });
};

const runMaintenance = () => {
  logToDashboard('🧹 Starting maintenance cycle (Sanitize & Enrich)...', 'MAINT');
  const cliPath = path.join(__dirname, '../cli/index.js');
  
  // Sanitize first, then enrich
  exec(`node "${cliPath}" sanitize`, (err) => {
    if (err) logToDashboard(`❌ Sanitization failed: ${err.message}`, 'ERROR');
    
    exec(`node "${cliPath}" enrich --limit 20`, (error) => {
      if (error) logToDashboard(`❌ Enrichment failed: ${error.message}`, 'ERROR');
      logToDashboard('✅ Maintenance cycle completed.');
    });
  });
};

// Main Scrape - Hourly
cron.schedule('0 * * * *', runScrape);

// Maintenance - Every 4 Hours
cron.schedule('0 */4 * * *', runMaintenance);

// Startup execution
logToDashboard('⚡ Initializing production services...');
runScrape();
setTimeout(runMaintenance, 1000 * 60 * 10); // 10 mins after startup
