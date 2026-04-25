const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class BaseScraper {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    ];
    this.logPath = path.join(process.cwd(), 'logs', 'scraper.log');
    this.ensureLogDir();
  }

  ensureLogDir() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFileSync(this.logPath, logEntry);
    if (level === 'ERROR') console.error(logEntry.trim());
    else console.log(logEntry.trim());
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  async delay(minMs = 2000, maxMs = 5000) {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchHtmlFast(url, retryCount = 0) {
    const maxRetries = parseInt(process.env.MAX_RETRIES || '3');
    try {
      await this.delay(2000 * (retryCount + 1), 5000 * (retryCount + 1)); // Exponential backoff
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Referer': 'https://www.google.com/'
        },
        timeout: 15000
      });
      return cheerio.load(response.data);
    } catch (error) {
      if (error.response && error.response.status === 429 && retryCount < maxRetries) {
        this.log(`Rate limited (429) for ${url}. Retry ${retryCount + 1}/${maxRetries}...`, 'WARNING');
        return this.fetchHtmlFast(url, retryCount + 1);
      }
      this.log(`Axios Error fetching ${url}: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async fetchHtmlHeadless(url) {
    let browser = null;
    try {
      await this.delay();
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Production safety
      });
      const page = await browser.newPage();
      await page.setUserAgent(this.getRandomUserAgent());
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const content = await page.content();
      return cheerio.load(content);
    } catch (error) {
      this.log(`Puppeteer Error fetching ${url}: ${error.message}`, 'ERROR');
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async fetch(url, useHeadlessFallback = false) {
    let $ = await this.fetchHtmlFast(url);
    if (!$ && useHeadlessFallback) {
      this.log(`Falling back to headless browser for ${url}`, 'INFO');
      $ = await this.fetchHtmlHeadless(url);
    }
    return $;
  }

  async getJobDetails(url, companyName) {
    this.log(`Fetching deep intelligence for: ${companyName} (${url})`, 'INFO');
    const $ = await this.fetch(url, true);
    if (!$) return null;

    let descriptionText = '';
    const possibleContainers = ['main', 'article', '.job-description', '.description', '#job-details', '.show-more-less-html__markup', '.details-text'];
    for (const selector of possibleContainers) {
      if ($(selector).length) {
        descriptionText = $(selector).text().trim().replace(/[ \t]+/g, ' ');
        if (descriptionText.length > 200) break;
      }
    }
    
    if (!descriptionText || descriptionText.length < 200) {
      descriptionText = $('body').text().trim().replace(/[ \t]+/g, ' ');
    }

    // Advanced Email Extraction (Handles Obfuscation)
    const emailRegex = /([a-zA-Z0-9._-]+)\s*(?:@|\[at\]|\(at\)|\{at\}|\s+at\s+)\s*([a-zA-Z0-9._-]+)\s*(?:\.|\[dot\]|\(dot\)|\{dot\}|\s+dot\s+)\s*([a-zA-Z]{2,})/gi;
    let emailsFound = [];
    let match;
    
    while ((match = emailRegex.exec(descriptionText)) !== null) {
      const cleanEmail = `${match[1]}@${match[2]}.${match[3]}`.toLowerCase();
      emailsFound.push(cleanEmail);
    }

    // Also look for standard mailto links
    $('a[href^="mailto:"]').each((i, el) => {
      const href = $(el).attr('href').replace('mailto:', '').split('?')[0].trim().toLowerCase();
      if (href) emailsFound.push(href);
    });

    const contactEmail = [...new Set(emailsFound)].filter(e => 
      !e.includes('sentry.io') && 
      !e.endsWith('.png') && 
      !e.endsWith('.jpg') &&
      !e.includes('example.com')
    ).join(', ');

    let companyUrl = '';
    const companyLower = companyName ? companyName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    if (companyLower) {
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('http') && !href.includes('linkedin.com') && !href.includes('wellfound.com') && !href.includes('google.com')) {
          try {
            const domain = new URL(href).hostname.replace('www.', '').toLowerCase();
            if (domain.includes(companyLower)) {
              companyUrl = href;
              return false;
            }
          } catch(e) {}
        }
      });
    }

    this.log(`Successfully extracted intelligence for ${companyName}`, 'INFO');
    return {
      jobDescription: descriptionText.substring(0, 8000), // Increased limit for production
      contactEmail: contactEmail || null,
      companyUrl: companyUrl || null
    };
  }
}

module.exports = BaseScraper;
