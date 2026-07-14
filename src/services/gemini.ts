
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface AIResponse {
  text: string;
  error?: string;
}

export const geminiService = {
  async explainCode(code: string, language: string): Promise<AIResponse> {
    try {
      const prompt = `Explain this ${language} code in a clear and concise way. Focus on what the code does, key patterns used, and any potential improvements:\n\n\`\`\`${language}\n${code}\n\`\`\``;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return { text: response.text() };
    } catch (error: any) {
      return { text: '', error: error.message || 'Failed to explain code' };
    }
  },

  async generateCode(description: string, language: string, context?: string): Promise<AIResponse> {
    try {
      const prompt = context 
        ? `Generate ${language} code for: ${description}\n\nContext:\n${context}\n\nProvide only the code, no explanation.`
        : `Generate ${language} code for: ${description}\n\nProvide only the code, no explanation.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return { text: response.text() };
    } catch (error: any) {
      return { text: '', error: error.message || 'Failed to generate code' };
    }
  },

  async reviewCode(code: string, language: string): Promise<AIResponse> {
    try {
      const prompt = `Review this ${language} code for:\n1. Bugs and errors\n2. Performance issues\n3. Security vulnerabilities\n4. Code style and best practices\n5. Suggestions for improvement\n\nProvide specific, actionable feedback:\n\n\`\`\`${language}\n${code}\n\`\`\``;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return { text: response.text() };
    } catch (error: any) {
      return { text: '', error: error.message || 'Failed to review code' };
    }
  },

  async fixCode(code: string, language: string, error?: string): Promise<AIResponse> {
    try {
      const prompt = error
        ? `Fix this ${language} code. The error is: ${error}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide the fixed code with a brief explanation of what was changed.`
        : `Fix any issues in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide the fixed code with a brief explanation of what was changed.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return { text: response.text() };
    } catch (error: any) {
      return { text: '', error: error.message || 'Failed to fix code' };
    }
  },

  async refactorCode(code: string, language: string, instructions: string): Promise<AIResponse> {
    try {
      const prompt = `Refactor this ${language} code according to these instructions: ${instructions}\n\nOriginal code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide the refactored code with a brief explanation of the changes made.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return { text: response.text() };
    } catch (error: any) {
      return { text: '', error: error.message || 'Failed to refactor code' };
    }
  },

  async chat(message: string, history: Array<{ role: string; content: string }> = []): Promise<AIResponse> {
    try {
      const chat = model.startChat({
        history: history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
      });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return { text: response.text() };
    } catch (error: any) {
      return { text: '', error: error.message || 'Failed to get response' };
    }
  }
};
