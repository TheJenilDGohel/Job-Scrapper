const BaseScraper = require('./baseScraper');

class LinkedinScraper extends BaseScraper {
  async scrapeJobs(keyword, location) {
    const jobs = [];
    const encodedKeyword = encodeURIComponent(keyword);
    const encodedLocation = encodeURIComponent(location);
    const pages = [0, 25, 50, 75]; // First 4 pages (100 jobs total)
    
    for (const start of pages) {
      const url = `https://www.linkedin.com/jobs/search?keywords=${encodedKeyword}&location=${encodedLocation}&geoId=102713980&f_TPR=r86400&start=${start}`;

      console.log(`Scraping LinkedIn page ${start / 25 + 1}...`);
      const $ = await this.fetch(url, false);

      if (!$) {
        console.log(`Failed to fetch LinkedIn jobs page at start=${start}.`);
        continue;
      }

      // Parse the jobs from the HTML
      $('.jobs-search__results-list li').each((index, element) => {
        const jobTitle = $(element).find('.base-search-card__title').text().trim();
        const company = $(element).find('.base-search-card__subtitle').text().trim();
        const jobLocation = $(element).find('.job-search-card__location').text().trim();
        const jobUrl = $(element).find('.base-card__full-link').attr('href');
        
        if (jobTitle && company && jobUrl) {
          jobs.push({
            jobTitle,
            company,
            location: jobLocation,
            url: jobUrl.split('?')[0], // remove tracking params
            source: 'LinkedIn'
          });
        }
      });
      
      // Small delay between pages
      if (start === 0) await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`Found ${jobs.length} total jobs on LinkedIn.`);
    return jobs;
  }
}

module.exports = LinkedinScraper;
