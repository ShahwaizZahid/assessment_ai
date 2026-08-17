import Groq from 'groq-sdk';
import { parseRoleOutput } from '../jsonOutput.js';
import { requireApiKey, requirePrompt } from './requireKey.js';

export async function generate({ role, prompt }) {
  const started = Date.now();
  const { system, user, version } = requirePrompt(prompt);
  const client = new Groq({ apiKey: requireApiKey('GROQ_API_KEY') });
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  const outputData = parseRoleOutput(role, raw);

  return {
    provider: 'groq',
    model: completion.model || model,
    role,
    promptVersion: version || 'v1',
    status: 'completed',
    outputData,
    errorMessage: null,
    latencyMs: Date.now() - started,
  };
}
