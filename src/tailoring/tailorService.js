const { GoogleGenerativeAI } = require("@google/generative-ai");

class TailorService {
  constructor(apiKey) {
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not provided. Tailoring service will be disabled.');
    }
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async generateSuggestions(resumeText, jobDescription) {
    if (!this.genAI) {
      throw new Error('AI Service not configured. Please add GEMINI_API_KEY to .env');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an expert career coach and technical recruiter. 
        I will provide you with a candidate's resume text and a job description.
        Your task is to suggest specific improvements to the candidate's resume to make it more relevant to the job.
        
        Focus on:
        1. Specific bullet point changes (e.g., "Change 'Built apps' to 'Architected performance-oriented Flutter apps for 1M+ users'")
        2. Missing keywords that the candidate should add.
        3. Which parts of their experience to highlight most.

        Format the output as a JSON object with this structure:
        {
          "suggestions": [
            { "original": "...", "suggested": "...", "reason": "..." }
          ],
          "missingKeywords": ["...", "..."],
          "summary": "..."
        }

        Resume Text:
        ${resumeText}

        Job Description:
        ${jobDescription}
        
        Return ONLY the JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating suggestions with Gemini:', error);
      throw new Error('Failed to generate tailoring suggestions. AI might be overloaded.');
    }
  }
}

module.exports = TailorService;
