const BaseScraper = require('./baseScraper');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class NaukriScraper extends BaseScraper {
  async scrapeJobs(keyword, location) {
    const jobs = [];
    // Naukri URL format: naukri.com/keyword-jobs-in-location
    const formattedKeyword = keyword.toLowerCase().replace(/ /g, '-');
    const formattedLocation = location.toLowerCase().replace(/ /g, '-');
    
    // We'll scrape first 2 pages for Naukri due to its heavy rendering cost
    const pages = [1, 2];

    let browser = null;
    try {
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setUserAgent(this.getRandomUserAgent());

      for (const p of pages) {
        const url = `https://www.naukri.com/${formattedKeyword}-jobs-in-${formattedLocation}-${p}`;
        console.log(`Scraping Naukri page ${p}...`);

        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
          // Wait for the job grid to appear
          await page.waitForSelector('.list', { timeout: 10000 });
          
          const content = await page.content();
          const $ = cheerio.load(content);

          $('.cust-job-tuple').each((index, element) => {
            const jobTitle = $(element).find('.title').text().trim();
            const company = $(element).find('.comp-name').text().trim();
            const jobLocation = $(element).find('.locWraper').text().trim();
            const jobUrl = $(element).find('.title').attr('href');
            
            if (jobTitle && company && jobUrl) {
              jobs.push({
                jobTitle,
                company,
                location: jobLocation,
                url: jobUrl.startsWith('http') ? jobUrl : `https://www.naukri.com${jobUrl}`,
                source: 'Naukri'
              });
            }
          });
        } catch (err) {
          console.log(`Error on Naukri page ${p}: ${err.message}`);
        }
        
        await this.delay(3000, 6000);
      }
    } catch (error) {
      console.error('Naukri Puppeteer Error:', error.message);
    } finally {
      if (browser) await browser.close();
    }

    console.log(`Found ${jobs.length} total jobs on Naukri.`);
    return jobs;
  }
}

module.exports = NaukriScraper;
