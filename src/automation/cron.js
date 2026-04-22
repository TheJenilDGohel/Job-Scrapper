const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('=== Starting Background Job Scraper ==='));
console.log('Scheduled to run every 6 hours.');

// Run every 6 hours: '0 */6 * * *'
// For testing you can use: '*/1 * * * *' (every minute)
cron.schedule('0 */6 * * *', () => {
  console.log(chalk.yellow(`\n[${new Date().toISOString()}] Running scheduled job...`));
  
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
});
