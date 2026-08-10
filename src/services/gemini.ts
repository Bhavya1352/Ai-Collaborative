import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const AI_AVAILABLE =
  API_KEY.length > 10 &&
  API_KEY !== 'YOUR_GEMINI_API_KEY';

const ai = AI_AVAILABLE
  ? new GoogleGenAI({ apiKey: API_KEY })
  : null;

const MODEL = 'gemini-3.6-flash';

export interface AIResponse {
  text: string;
  error?: string;
}

const notConfigured = (): AIResponse => ({
  text: '',
  error:
    'AI is not configured. Check VITE_GEMINI_API_KEY in your .env file.',
});

async function generate(prompt: string): Promise<AIResponse> {
  if (!ai) return notConfigured();

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 2048,
      },
    });

    return {
      text: response.text || '',
    };
  } catch (error: any) {
    console.error('[Gemini]', error);

    return {
      text: '',
      error:
        error?.message ||
        'Failed to get response from Gemini.',
    };
  }
}

export const geminiService = {
  async explainCode(
    code: string,
    language: string
  ): Promise<AIResponse> {
    return generate(`
You are a senior software developer.

Explain this ${language} code clearly and concisely.

Cover:
- What the code does
- Important logic
- Patterns used
- Possible improvements

Code:

\`\`\`${language}
${code}
\`\`\`
`);
  },

  async generateCode(
    description: string,
    language: string,
    context?: string
  ): Promise<AIResponse> {
    return generate(`
Generate ${language} code for:

${description}

${context ? `Context:\n${context}` : ''}

Provide the code followed by a short explanation.
`);
  },

  async reviewCode(
    code: string,
    language: string
  ): Promise<AIResponse> {
    return generate(`
Review this ${language} code.

Check:
1. Bugs and errors
2. Performance
3. Security
4. Code quality
5. Best practices
6. Improvements

Code:

\`\`\`${language}
${code}
\`\`\`
`);
  },

  async fixCode(
    code: string,
    language: string,
    error?: string
  ): Promise<AIResponse> {
    return generate(`
Fix this ${language} code.

${error ? `Current error:\n${error}` : ''}

Code:

\`\`\`${language}
${code}
\`\`\`

Return:
1. Fixed code
2. Short explanation
`);
  },

  async refactorCode(
    code: string,
    language: string,
    instructions: string
  ): Promise<AIResponse> {
    return generate(`
Refactor this ${language} code.

Instructions:
${instructions}

Original code:

\`\`\`${language}
${code}
\`\`\`

Return the improved code and a short explanation.
`);
  },

  async chat(
    message: string,
    history: Array<{
      role: string;
      content: string;
    }> = []
  ): Promise<AIResponse> {
    if (!ai) return notConfigured();

    try {
      const contents = [
        ...history.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          maxOutputTokens: 2048,
        },
      });

      return {
        text: response.text || '',
      };
    } catch (error: any) {
      console.error('[Gemini Chat]', error);

      return {
        text: '',
        error:
          error?.message ||
          'Failed to get AI response.',
      };
    }
  },

  async streamChat(
    message: string,
    history: Array<{
      role: string;
      content: string;
    }> = [],
    onChunk: (text: string) => void,
    onDone?: () => void,
    onError?: (err: string) => void
  ): Promise<void> {
    if (!ai) {
      onError?.(
        'AI is not configured. Check VITE_GEMINI_API_KEY.'
      );
      onDone?.();
      return;
    }

    try {
      const contents = [
        ...history.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const stream = await ai.models.generateContentStream({
        model: MODEL,
        contents,
        config: {
          maxOutputTokens: 2048,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text || '';

        if (text) {
          onChunk(text);
        }
      }

      onDone?.();
    } catch (error: any) {
      console.error('[Gemini Stream]', error);

      onError?.(
        error?.message || 'Streaming failed.'
      );
    }
  },

  async streamExplainCode(
    code: string,
    language: string,
    onChunk: (text: string) => void,
    onDone?: () => void,
    onError?: (err: string) => void
  ): Promise<void> {
    if (!ai) {
      onError?.(
        'AI is not configured. Check VITE_GEMINI_API_KEY.'
      );
      onDone?.();
      return;
    }

    try {
      const prompt = `
You are a senior developer.

Explain this ${language} code clearly.

Cover:
- What it does
- Key logic
- Important patterns
- Problems
- Improvements

Code:

\`\`\`${language}
${code}
\`\`\`
`;

      const stream =
        await ai.models.generateContentStream({
          model: MODEL,
          contents: prompt,
          config: {
            maxOutputTokens: 2048,
          },
        });

      for await (const chunk of stream) {
        const text = chunk.text || '';

        if (text) {
          onChunk(text);
        }
      }

      onDone?.();
    } catch (error: any) {
      console.error('[Gemini Explain]', error);

      onError?.(
        error?.message || 'Streaming failed.'
      );
    }
  },

  isAvailable(): boolean {
    return AI_AVAILABLE;
  },
};