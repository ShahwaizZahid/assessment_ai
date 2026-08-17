import OpenAI from 'openai';
import { parseRoleOutput } from '../jsonOutput.js';
import { requireApiKey, requirePrompt } from './requireKey.js';

export async function generate({ role, prompt }) {
  const started = Date.now();
  const { system, user, version } = requirePrompt(prompt);
  const client = new OpenAI({ apiKey: requireApiKey('OPENAI_API_KEY') });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
    provider: 'openai',
    model: completion.model || model,
    role,
    promptVersion: version || 'v1',
    status: 'completed',
    outputData,
    errorMessage: null,
    latencyMs: Date.now() - started,
  };
}
