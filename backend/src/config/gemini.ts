import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

if (!env.gemini.apiKey) {
  // Non-fatal: allows the rest of the API to boot without AI features configured
  // eslint-disable-next-line no-console
  console.warn('[gemini] GEMINI_API_KEY is not set. AI features will fail until configured.');
}

export const genAI = new GoogleGenerativeAI(env.gemini.apiKey);

export function getGeminiModel(jsonMode = false) {
  return genAI.getGenerativeModel({
    model: env.gemini.model,
    generationConfig: jsonMode
      ? { responseMimeType: 'application/json', temperature: 0.2 }
      : { temperature: 0.3 },
  });
}
