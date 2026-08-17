import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseRoleOutput } from '../jsonOutput.js';
import { requireApiKey, requirePrompt } from './requireKey.js';

export async function generate({ role, prompt }) {
  const started = Date.now();
  const { system, user, version } = requirePrompt(prompt);
  const client = new GoogleGenerativeAI(requireApiKey('GEMINI_API_KEY'));
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(user);
  const raw = result.response.text();
  const outputData = parseRoleOutput(role, raw);

  return {
    provider: 'gemini',
    model: modelName,
    role,
    promptVersion: version || 'v1',
    status: 'completed',
    outputData,
    errorMessage: null,
    latencyMs: Date.now() - started,
  };
}
