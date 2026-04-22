const BaseScraper = require('./baseScraper');

class WellfoundScraper extends BaseScraper {
  async scrapeJobs(keyword, location) {
    // Wellfound often requires JS, so we might need headless fallback
    const jobs = [];
    const encodedKeyword = encodeURIComponent(keyword);
    // Wellfound URL structure varies, we'll use a hypothetical search URL
    const url = `https://wellfound.com/role/l/${encodedKeyword}/${encodeURIComponent(location)}`;

    console.log(`Scraping Wellfound for ${keyword} in ${location}...`);
    
    // Using headless fallback since Wellfound blocks basic axios requests easily
    const $ = await this.fetch(url, true);

    if (!$) {
      console.log('Failed to fetch Wellfound jobs page.');
      return jobs;
    }

    // Example parsing logic (selectors would need to match actual Wellfound structure)
    $('.styles_component__U_Z7b').each((index, element) => {
      const jobTitle = $(element).find('.styles_title__1-zB7').text().trim();
      const company = $(element).find('.styles_name__21wA8').text().trim();
      const jobLocation = $(element).find('.styles_location__3B_nQ').text().trim();
      const jobUrl = $(element).find('.styles_title__1-zB7').closest('a').attr('href');
      
      if (jobTitle && company) {
        jobs.push({
          jobTitle,
          company,
          location: jobLocation,
          url: jobUrl ? (jobUrl.startsWith('http') ? jobUrl : `https://wellfound.com${jobUrl}`) : url,
          source: 'Wellfound'
        });
      }
    });

    console.log(`Found ${jobs.length} jobs on Wellfound.`);
    return jobs;
  }
}

module.exports = WellfoundScraper;
