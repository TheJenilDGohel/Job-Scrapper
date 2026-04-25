const BaseScraper = require('./baseScraper');

class IndeedScraper extends BaseScraper {
  async scrapeJobs(keyword, location) {
    const jobs = [];
    const encodedKeyword = encodeURIComponent(keyword);
    const encodedLocation = encodeURIComponent(location);
    
    // Indeed pagination: start=0, 10, 20... (10 jobs per page)
    const pages = [0, 10]; 

    for (const start of pages) {
      const url = `https://www.indeed.com/jobs?q=${encodedKeyword}&l=${encodedLocation}&start=${start}&fromage=1`;
      console.log(`Scraping Indeed page ${start / 10 + 1}...`);

      const $ = await this.fetch(url, true); // Use headless fallback for Indeed

      if (!$) {
        console.log(`Failed to fetch Indeed page at start=${start}.`);
        continue;
      }

      $('.job_seen_beacon').each((index, element) => {
        const jobTitle = $(element).find('h2.jobTitle span[title]').text().trim();
        const company = $(element).find('[data-testid="company-name"]').text().trim();
        const jobLocation = $(element).find('[data-testid="text-location"]').text().trim();
        const jobUrl = $(element).find('h2.jobTitle a').attr('href');
        
        if (jobTitle && company && jobUrl) {
          jobs.push({
            jobTitle,
            company,
            location: jobLocation,
            url: jobUrl.startsWith('http') ? jobUrl : `https://www.indeed.com${jobUrl}`,
            source: 'Indeed'
          });
        }
      });
      
      await this.delay(4000, 8000);
    }

    console.log(`Found ${jobs.length} total jobs on Indeed.`);
    return jobs;
  }
}

module.exports = IndeedScraper;
