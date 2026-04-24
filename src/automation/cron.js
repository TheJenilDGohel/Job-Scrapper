const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('=== Starting Background Job Scraper ==='));
console.log('Scheduled to run every 1 hour.');

// Run every hour: '0 * * * *'
const runJob = () => {
  console.log(chalk.yellow(`\n[${new Date().toISOString()}] Running job scrape...`));
  
  const cliPath = path.join(__dirname, '../cli/index.js');
  
  exec(`node "${cliPath}" run`, (error, stdout, stderr) => {
    if (error) {
      console.error(chalk.red(`Error executing job: ${error.message}`));
      return;
    }
    if (stderr) {
      console.error(chalk.yellow(`Stderr: ${stderr}`));
    }
    console.log(stdout);
    console.log(chalk.green(`[${new Date().toISOString()}] Job completed.`));
  });
};

// Schedule for every hour
cron.schedule('0 * * * *', runJob);

// Run once immediately on startup
console.log(chalk.cyan('Triggering initial startup scrape...'));
runJob();
