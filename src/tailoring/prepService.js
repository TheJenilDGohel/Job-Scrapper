const { GoogleGenerativeAI } = require("@google/generative-ai");

class PrepService {
  constructor(apiKey) {
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async generatePrepMaterial(resumeText, jobDescription) {
    if (!this.genAI) {
      throw new Error('AI Service not configured. Please add GEMINI_API_KEY to .env');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an expert interviewer for top tech companies (Google, Meta, etc.).
        I will provide a candidate's resume and a job description. 
        Generate a comprehensive interview preparation guide for them.
        
        Focus on:
        1. Technical Questions: Specific to the stack in the JD.
        2. Behavioral Questions: Based on the candidate's actual experience and JD requirements.
        3. Strategic Tips: What they should emphasize most to get this specific job.

        Format the output as a JSON object:
        {
          "technicalQuestions": [
            { "question": "...", "context": "Why this matters for this role" }
          ],
          "behavioralQuestions": [
             { "question": "...", "context": "How it relates to their resume" }
          ],
          "focusAreas": ["...", "..."],
          "summary": "..."
        }

        Resume:
        ${resumeText}

        Job Description:
        ${jobDescription}
        
        Return ONLY the JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating prep material with Gemini:', error);
      throw new Error('Failed to generate interview prep materials.');
    }
  }
}

module.exports = PrepService;
