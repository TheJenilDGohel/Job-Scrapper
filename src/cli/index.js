const { program } = require('commander');
const chalk = require('chalk');
const { table } = require('table');
const path = require('path');
const CvParser = require('../parser/cvParser');
const { getStorage } = require('../storage/index');
const LinkedinScraper = require('../scraper/linkedinScraper');
const WellfoundScraper = require('../scraper/wellfoundScraper');
const MatchingEngine = require('../matching/engine');
const NotificationService = require('../notifications/index');

program
  .version('1.0.0')
  .description('Autonomous Job Scraper CLI');

program
  .command('run')
  .description('Run the full extraction, scraping, and matching pipeline')
  .option('-c, --cv <path>', 'Path to your CV (PDF)', path.join(__dirname, '../../sample.pdf'))
  .option('-l, --location <location>', 'Location to search for jobs', 'India')
  .action(async (options) => {
    try {
      console.log(chalk.blue('=== Autonomous Job Scraper ==='));
      
      // 1. Parse CV
      console.log(chalk.yellow('\n[1] Parsing CV...'));
      const cvParser = new CvParser(options.cv);
      // Create a dummy pdf or just mock the parse if pdf doesn't exist
      let userProfile;
      try {
        userProfile = await cvParser.parse();
      } catch (err) {
        console.log(chalk.red(`Failed to read CV at ${options.cv}, using fallback profile.`));
        userProfile = {
          skills: ['javascript', 'react', 'node', 'express'],
          roles: ['Software Engineer', 'Full Stack Developer', 'Frontend Developer'],
          experience: 2
        };
      }
      console.log(chalk.green('Profile built successfully!'));
      console.log(userProfile);

      // 2. Initialize Storage
      console.log(chalk.yellow('\n[2] Initializing Storage...'));
      const storage = getStorage();

      // 3. Run Scrapers
      console.log(chalk.yellow('\n[3] Scraping Jobs...'));
      let allJobs = [];
      const linkedin = new LinkedinScraper();
      const wellfound = new WellfoundScraper();

      for (const role of userProfile.roles) {
        console.log(chalk.dim(`Scraping for role: ${role} in ${options.location}`));
        const liJobs = await linkedin.scrapeJobs(role, options.location);
        const wfJobs = await wellfound.scrapeJobs(role, options.location);
        allJobs = allJobs.concat(liJobs, wfJobs);
      }

      console.log(chalk.green(`Found ${allJobs.length} potential jobs.`));

      // 4. Match & Rank
      console.log(chalk.yellow('\n[4] Scoring & Ranking...'));
      const engine = new MatchingEngine(userProfile);
      const rankedJobs = engine.rankJobs(allJobs);

      // 5. Save & Output
      console.log(chalk.yellow('\n[5] Saving & Displaying Results...'));
      const newJobs = [];
      for (const job of rankedJobs) {
        if (!(await storage.exists(job.url))) {
          // Deep scrape for high-potential jobs
          if (job.score > 40) {
            process.stdout.write(chalk.dim(`  - Deep scraping: ${job.jobTitle.substring(0, 20)}... `));
            const scraper = job.source === 'LinkedIn' ? linkedin : wellfound;
            const details = await scraper.getJobDetails(job.url, job.company);
            if (details) {
              Object.assign(job, details);
              console.log(chalk.green('Done'));
            } else {
              console.log(chalk.red('Failed'));
            }
          }
          
          await storage.save(job);
          newJobs.push(job);
        }
      }
      
      console.log(chalk.green(`Saved ${newJobs.length} new jobs.`));

      if (newJobs.length > 0) {
        const data = [
          ['Score', 'Title', 'Company', 'Matched Skills', 'URL']
        ];
        
        newJobs.slice(0, 10).forEach(job => {
          data.push([
            job.score.toString(),
            job.jobTitle.substring(0, 30),
            job.company.substring(0, 20),
            job.matchedSkills.join(', ').substring(0, 20),
            job.url.substring(0, 30) + '...'
          ]);
        });

        console.log(table(data));

        // 6. Notify
        const notifier = new NotificationService();
        await notifier.notify(newJobs.filter(j => j.score > 50));
      } else {
        console.log('No new jobs found this run.');
      }

    } catch (error) {
      console.error(chalk.red('Error during execution:'), error);
    }
  });

program.parse(process.argv);
