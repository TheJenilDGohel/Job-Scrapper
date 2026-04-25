const { program } = require('commander');
const chalk = require('chalk');
const { table } = require('table');
const path = require('path');
const CvParser = require('../parser/cvParser');
const { getStorage } = require('../storage/index');
const LinkedinScraper = require('../scraper/linkedinScraper');
const WellfoundScraper = require('../scraper/wellfoundScraper');
const NaukriScraper = require('../scraper/naukriScraper');
const IndeedScraper = require('../scraper/indeedScraper');
const MatchingEngine = require('../matching/engine');
const NotificationService = require('../notifications/index');
const Sanitizer = require('../utils/sanitizer');

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

      // Get all profiles or use default
      let profiles = await storage.getProfiles();
      if (profiles.length === 0) {
        console.log(chalk.dim('No database profiles found. Using fallback...'));
        profiles = [{
          id: null,
          name: 'Default Flutter Profile',
          roles: userProfile.roles,
          skills: userProfile.skills,
          experience: userProfile.experience
        }];
      }

      // 3. Run Scrapers
      console.log(chalk.yellow('\n[3] Scraping & Matching across all profiles...'));
      let newJobsCount = 0;
      
      const linkedin = new LinkedinScraper();
      const wellfound = new WellfoundScraper();
      const naukri = new NaukriScraper();
      const indeed = new IndeedScraper();

      for (const profile of profiles) {
        console.log(chalk.cyan(`\nProcessing Profile: ${profile.name}`));
        let profileJobs = [];

        for (const role of profile.roles) {
          console.log(chalk.dim(`- Scraping for: ${role} in ${options.location}`));
          
          const [liJobs, wfJobs, nkJobs, indJobs] = await Promise.all([
            linkedin.scrapeJobs(role, options.location).catch(e => []),
            wellfound.scrapeJobs(role, options.location).catch(e => []),
            naukri.scrapeJobs(role, options.location).catch(e => []),
            indeed.scrapeJobs(role, options.location).catch(e => [])
          ]);

          profileJobs = profileJobs.concat(liJobs, wfJobs, nkJobs, indJobs);
        }

        // Filter duplicates for this profile run
        const uniqueProfileJobs = Array.from(new Map(profileJobs.map(item => [item.url, item])).values());
        
        // Match & Score
        const engine = new MatchingEngine(profile);
        const rankedJobs = engine.rankJobs(uniqueProfileJobs, profile);

        console.log(chalk.yellow(`- Deep Scoping matches for ${profile.name}...`));
        for (const job of rankedJobs) {
          const alreadyExists = await storage.exists(job.url);
          if (!alreadyExists && job.score >= 40) {
            console.log(chalk.dim(`  * Deep scraping: ${job.jobTitle} @ ${job.company}... `));
            const details = await linkedin.getJobDetails(job.url, job.company);
            if (details) {
              Object.assign(job, details);
              const updatedJob = engine.scoreJob(job, profile);
              Object.assign(job, updatedJob);
            }
            
            job.profileId = profile.id;
            await storage.save(job);
            newJobsCount++;
          } else if (!alreadyExists) {
            // Save even if low score but don't deep scrape
            job.profileId = profile.id;
            await storage.save(job);
            newJobsCount++;
          }
        }
      }
      
      console.log(chalk.green(`\nScrape cycle finished. Saved ${newJobsCount} new jobs total.`));

      if (newJobsCount > 0) {
        const notifier = new NotificationService();
        // Just trigger general check for high scores across all profiles for notification
        const allJobs = await storage.getAllJobs();
        const alertJobs = allJobs.slice(0, 10).filter(j => j.score > 75);
        if (alertJobs.length > 0) await notifier.notify(alertJobs);
      } else {
        console.log('No new jobs found this run.');
      }

    } catch (error) {
      console.error(chalk.red('Error during execution:'), error);
    }
  });

program
  .command('enrich')
  .description('Enrich older jobs missing descriptions or contact info')
  .option('-l, --limit <number>', 'Number of jobs to enrich', '10')
  .action(async (options) => {
    try {
      console.log(chalk.blue('=== Job Intelligence Enrichment ==='));
      const storage = getStorage();
      const linkedin = new LinkedinScraper();
      
      const jobs = await storage.getJobsMissingIntelligence(parseInt(options.limit));
      console.log(chalk.yellow(`Found ${jobs.length} jobs requiring intelligence recovery.`));

      for (const job of jobs) {
        console.log(chalk.dim(`- Enriching: ${job.jobTitle} @ ${job.company}... `));
        
        // We use linkedinScraper's getJobDetails as the primary deep discovery tool
        const details = await linkedin.getJobDetails(job.url, job.company);
        
        if (details) {
          Object.assign(job, details);
          await storage.save(job);
          console.log(chalk.green('Done'));
        } else {
          console.log(chalk.red('Failed (No data found or blocked)'));
        }
        
        // Anti-blocking delay
        await new Promise(r => setTimeout(r, 5000));
      }

      console.log(chalk.green('\nEnrichment cycle completed.'));
    } catch (error) {
      console.error(chalk.red('Enrichment error:'), error);
    }
  });

program
  .command('sanitize')
  .description('Sanitize and normalize all existing job data in the database')
  .action(async () => {
    try {
      console.log(chalk.blue('=== Data Sanitization ==='));
      const storage = getStorage();
      const allJobs = await storage.getAllJobs();
      console.log(chalk.yellow(`Found ${allJobs.length} jobs to sanitize.`));

      let sanitizedCount = 0;
      for (const job of allJobs) {
        const sanitized = Sanitizer.sanitizeJob(job);
        await storage.save(sanitized);
        sanitizedCount++;
        if (sanitizedCount % 50 === 0) console.log(chalk.dim(`Sanitized ${sanitizedCount}/${allJobs.length}...`));
      }

      console.log(chalk.green(`\nSanitization complete. ${sanitizedCount} records cleaned.`));
    } catch (error) {
      console.error(chalk.red('Sanitization error:'), error);
    }
  });

program
  .command('sync')
  .description('Force sync local database to Supabase cloud storage')
  .action(async () => {
    try {
      console.log(chalk.blue('=== Cloud Synchronization ==='));
      const storage = getStorage();
      if (storage.constructor.name !== 'SupabaseStorage') {
        console.log(chalk.red('Error: STORAGE_TYPE is not set to "supabase" in .env'));
        return;
      }

      const SqliteStorage = require('../storage/sqliteStorage');
      const localStore = new SqliteStorage('jobs.db');
      
      const allLocalJobs = await localStore.getAllJobs();
      console.log(chalk.yellow(`Syncing ${allLocalJobs.length} local records to Supabase...`));

      let syncCount = 0;
      for (const job of allLocalJobs) {
        await storage.save(job);
        syncCount++;
        if (syncCount % 20 === 0) console.log(chalk.dim(`Synced ${syncCount}/${allLocalJobs.length}...`));
      }

      console.log(chalk.green(`\nSync complete. ${syncCount} records backed up to cloud.`));
    } catch (error) {
      console.error(chalk.red('Sync error:'), error);
    }
  });

program
  .command('parallel-enrich')
  .description('Enrich jobs in parallel batches for high-speed email recovery')
  .option('-l, --limit <number>', 'Number of jobs to enrich', '50')
  .option('-b, --batch <number>', 'Batch size', '5')
  .action(async (options) => {
    try {
      console.log(chalk.blue('=== Parallel Job Enrichment ==='));
      const storage = getStorage();
      const linkedin = new LinkedinScraper();
      
      const jobs = await storage.getJobsMissingEmail(parseInt(options.limit));
      console.log(chalk.yellow(`Found ${jobs.length} jobs for parallel enrichment.`));

      const batchSize = parseInt(options.batch);
      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        console.log(chalk.cyan(`\nProcessing batch ${Math.floor(i/batchSize) + 1}...`));
        
        await Promise.all(batch.map(async (job) => {
          console.log(chalk.dim(`- Enriching: ${job.jobTitle} @ ${job.company}`));
          const details = await linkedin.getJobDetails(job.url, job.company);
          if (details) {
            Object.assign(job, details);
            await storage.save(job);
          }
        }));
        
        console.log(chalk.dim('Batch complete. Waiting to avoid rate limits...'));
        await new Promise(r => setTimeout(r, 10000));
      }

      console.log(chalk.green('\nParallel enrichment cycle completed.'));
    } catch (error) {
      console.error(chalk.red('Parallel enrichment error:'), error);
    }
  });

program.parse(process.argv);
