const fs = require('fs');
const pdfParse = require('pdf-parse');

class CvParser {
  constructor() {
    this.knownSkills = [
      'flutter', 'react native', 'kotlin', 'swift', 'javascript', 'typescript',
      'node.js', 'react', 'python', 'java', 'c++', 'sql', 'firebase', 'mongodb'
    ];
    this.knownRoles = [
      'mobile app developer', 'frontend developer', 'backend developer',
      'full stack developer', 'flutter developer', 'ios developer', 'android developer'
    ];
    this.knownKeywords = [
      'api', 'rest api', 'ui', 'ux', 'performance', 'ci/cd', 'agile', 'git'
    ];
  }

  async parsePdf(filepath) {
    try {
      const dataBuffer = fs.readFileSync(filepath);
      const data = await pdfParse(dataBuffer);
      return this.extractInformation(data.text);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw error;
    }
  }

  extractInformation(text) {
    const lowerText = text.toLowerCase();
    
    // Extract Skills
    const skills = this.knownSkills.filter(skill => 
      lowerText.includes(skill)
    );

    // Extract Roles
    const roles = this.knownRoles.filter(role => 
      lowerText.includes(role)
    );

    // Extract Keywords
    const keywords = this.knownKeywords.filter(keyword => 
      lowerText.includes(keyword)
    );

    // Basic heuristic for experience: look for "X years"
    let experience = 0;
    const expRegex = /(\d+(?:\.\d+)?)\s*years?(?:\s+of)?\s+experience/i;
    const match = lowerText.match(expRegex);
    if (match && match[1]) {
      experience = parseFloat(match[1]);
    }

    return {
      roles: roles,
      skills: skills,
      experience: experience,
      keywords: keywords
    };
  }
}

module.exports = CvParser;
