const { program } = require('commander');
const chalk = require('chalk');
const { table } = require('table');
const path = require('path');
const CvParser = require('../parser/cvParser');
const SqliteStorage = require('../storage/sqliteStorage');
const LinkedinScraper = require('../scraper/linkedinScraper');
const WellfoundScraper = require('../scraper/wellfoundScraper');
const MatchingEngine = require('../matching/engine');

program
  .version('1.0.0')
  .description('Autonomous Job Scraper CLI');

program
  .command('run')
  .description('Run the full extraction, scraping, and matching pipeline')
  .option('-c, --cv <path>', 'Path to your CV (PDF)', path.join(__dirname, '../../sample.pdf'))
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
      const storage = new SqliteStorage(path.join(__dirname, '../../data/jobs.db'));

      // 3. Run Scrapers
      console.log(chalk.yellow('\n[3] Scraping Jobs...'));
      let allJobs = [];
      const linkedin = new LinkedinScraper();
      const wellfound = new WellfoundScraper();

      // For each role, do a search
      for (const role of userProfile.roles) {
        console.log(chalk.dim(`Scraping for role: ${role}`));
        const liJobs = await linkedin.scrape(role, 'Remote'); // Hardcoded Remote for now
        const wfJobs = await wellfound.scrape(role, 'Remote');
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
        if (!storage.exists(job.jobUrl)) {
          storage.save(job);
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
            job.jobUrl.substring(0, 30) + '...'
          ]);
        });

        console.log(table(data));
      } else {
        console.log('No new jobs found this run.');
      }

    } catch (error) {
      console.error(chalk.red('Error during execution:'), error);
    }
  });

program.parse(process.argv);
