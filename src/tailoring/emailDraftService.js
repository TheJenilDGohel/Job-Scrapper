const { GoogleGenerativeAI } = require("@google/generative-ai");

class EmailDraftService {
  constructor(apiKey) {
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async generateDraft(resumeText, jobDescription, contactEmail, company, jobTitle) {
    if (!this.genAI) {
      throw new Error('AI Service not configured. Please add GEMINI_API_KEY to .env');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an expert technical recruiter and career coach.
        Draft a personalized cold outreach email for a candidate applying to a job.

        Input Data:
        Job Title: ${jobTitle}
        Company: ${company}
        Known Contact Email: ${contactEmail || 'Not provided'}
        Job Description:
        ${jobDescription}

        Candidate Resume:
        ${resumeText}

        Instructions:
        1. Extract the recruiter or hiring manager's name from the Job Description if it exists (e.g., "Send resumes to Jane Doe"). If you can't find one, use a generic greeting like "Hiring Team at ${company}".
        2. Draft a compelling, professional, and concise email.
        3. Highlight 1-2 specific achievements or skills from the Candidate Resume that perfectly match the core requirements in the Job Description.
        4. Include a clear subject line.

        Format the output strictly as a JSON object:
        {
          "subject": "The email subject line",
          "body": "The full email body text, including greeting and sign-off",
          "recipientName": "Extracted name or 'Hiring Team'"
        }
        
        Return ONLY the JSON. Do not include markdown formatting or backticks around the JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating email draft with Gemini:', error);
      throw new Error('Failed to draft the outreach email. AI might be overloaded.');
    }
  }
}

module.exports = EmailDraftService;
