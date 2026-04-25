const cheerio = require('cheerio');

class Sanitizer {
  static normalizeString(str) {
    if (!str) return '';
    return str
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
  }

  static cleanDescription(html) {
    if (!html) return '';
    const $ = cheerio.load(html);
    // Remove scripts and styles
    $('script, style').remove();
    let text = $.text();
    return this.normalizeString(text);
  }

  static sanitizeJob(job) {
    return {
      ...job,
      jobTitle: this.normalizeString(job.jobTitle),
      company: this.normalizeString(job.company),
      location: this.normalizeString(job.location),
      jobDescription: this.cleanDescription(job.jobDescription),
      contactEmail: this.normalizeString(job.contactEmail),
      companyUrl: this.normalizeString(job.companyUrl)
    };
  }
}

module.exports = Sanitizer;
