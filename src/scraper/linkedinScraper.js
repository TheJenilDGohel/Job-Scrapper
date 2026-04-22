const BaseScraper = require('./baseScraper');

class LinkedinScraper extends BaseScraper {
  async scrapeJobs(keyword, location) {
    const jobs = [];
    const encodedKeyword = encodeURIComponent(keyword);
    const encodedLocation = encodeURIComponent(location);
    // Use the public jobs search URL
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodedKeyword}&location=${encodedLocation}&f_TPR=r86400&position=1&pageNum=0`;

    console.log(`Scraping LinkedIn for ${keyword} in ${location}...`);
    const $ = await this.fetch(url, false); // Try fast fetch first

    if (!$) {
      console.log('Failed to fetch LinkedIn jobs page.');
      return jobs;
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

    console.log(`Found ${jobs.length} jobs on LinkedIn.`);
    return jobs;
  }
}

module.exports = LinkedinScraper;
