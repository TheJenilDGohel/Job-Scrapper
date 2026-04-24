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
          roles: [
            'flutter developer', 'mobile app developer', 'ios developer', 
            'android developer', 'dart developer', 'flutter lead'
          ],
          skills: ['flutter', 'dart', 'ios', 'android', 'firebase', 'mobile development'],
          experience: 1
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
      
      // 4. Matching & Scoring
      console.log(chalk.yellow('\n[4] Intelligent Matching...'));
      const engine = new MatchingEngine(userProfile);
      
      // Filter out duplicates and score
      const uniqueJobs = Array.from(new Map(allJobs.map(item => [item.url, item])).values());
      const matchedJobs = engine.rankJobs(uniqueJobs);
      
      // 5. Deep Scrape High Matches (Intelligence Layer)
      console.log(chalk.yellow('\n[5] Deep Discovery (Analyzing High-Quality Matches)...'));
      const newJobs = [];
      for (const job of matchedJobs) {
        // Only save if not already in storage
        const alreadyExists = await storage.exists(job.url);
        if (!alreadyExists) {
          // If score is decent, try to get more info
          if (job.score >= 40) {
            console.log(chalk.dim(`- Deep scraping: ${job.jobTitle} @ ${job.company}... `));
            const details = await linkedin.getJobDetails(job.url);
            if (details) {
              Object.assign(job, details);
              // Re-score with description
              const updatedJob = engine.scoreJob(job);
              Object.assign(job, updatedJob);
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
            (job.matchedSkills || []).join(', ').substring(0, 20),
            job.url.substring(0, 30) + '...'
          ]);
        });

        console.log(table(data));

        // 6. Notify
        const notifier = new NotificationService();
        // Notify only if score is high AND it's a mobile role
        const alertJobs = newJobs.filter(j => {
          const isMobile = j.jobTitle.toLowerCase().includes('flutter') || 
                           j.jobTitle.toLowerCase().includes('mobile') ||
                           j.jobTitle.toLowerCase().includes('ios') ||
                           j.jobTitle.toLowerCase().includes('android');
          return j.score > 70 || (isMobile && j.score > 50);
        });
        
        if (alertJobs.length > 0) {
          await notifier.notify(alertJobs);
        }
      } else {
        console.log('No new jobs found this run.');
      }

    } catch (error) {
      console.error(chalk.red('Error during execution:'), error);
    }
  });

program.parse(process.argv);
