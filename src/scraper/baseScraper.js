const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class BaseScraper {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
    ];
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  async delay(minMs = 2000, maxMs = 5000) {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchHtmlFast(url) {
    try {
      await this.delay();
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Axios Error fetching ${url}:`, error.message);
      return null;
    }
  }

  async fetchHtmlHeadless(url) {
    let browser = null;
    try {
      await this.delay();
      browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      await page.setUserAgent(this.getRandomUserAgent());
      await page.goto(url, { waitUntil: 'networkidle2' });
      const content = await page.content();
      return cheerio.load(content);
    } catch (error) {
      console.error(`Puppeteer Error fetching ${url}:`, error.message);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async fetch(url, useHeadlessFallback = false) {
    let $ = await this.fetchHtmlFast(url);
    // If axios fails or gets blocked, and fallback is true, try puppeteer
    if (!$ && useHeadlessFallback) {
      console.log(`Falling back to headless browser for ${url}`);
      $ = await this.fetchHtmlHeadless(url);
    }
    return $;
  }

  async getJobDetails(url, companyName) {
    const $ = await this.fetch(url, true);
    if (!$) return null;

    // 1. Job Description (Extracting raw text from common JD containers or body)
    // Often wrapped in 'main', 'article', '.description', or similar. If not, just grab body.
    let descriptionText = '';
    const possibleContainers = ['main', 'article', '.job-description', '.description', '#job-details', '.show-more-less-html__markup'];
    for (const selector of possibleContainers) {
      if ($(selector).length) {
        descriptionText = $(selector).text().trim().replace(/[ \t]+/g, ' '); // Only replace horizontal tabs/spaces
        if (descriptionText.length > 200) break; // Found a substantial block
      }
    }
    
    // Fallback to body if we couldn't find a good container
    if (!descriptionText || descriptionText.length < 200) {
      descriptionText = $('body').text().trim().replace(/[ \t]+/g, ' ');
    }

    // 2. Extract Contact Emails via Regex
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/gi;
    const emailsFound = descriptionText.match(emailRegex) || [];
    // remove duplicates and filter out image/sentry/common false positives
    const contactEmail = [...new Set(emailsFound)].filter(e => 
      !e.includes('sentry.io') && 
      !e.endsWith('.png') && 
      !e.endsWith('.jpg')
    ).join(', ');

    // 3. Extract Company URL
    let companyUrl = '';
    const companyLower = companyName ? companyName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    if (companyLower) {
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('http') && !href.includes('linkedin.com') && !href.includes('wellfound.com')) {
          const domain = new URL(href).hostname.replace('www.', '').toLowerCase();
          if (domain.includes(companyLower)) {
            companyUrl = href;
            return false; // Break loop
          }
        }
      });
    }

    return {
      jobDescription: descriptionText.substring(0, 5000), // Limit size for DB
      contactEmail: contactEmail || null,
      companyUrl: companyUrl || null
    };
  }
}

module.exports = BaseScraper;
