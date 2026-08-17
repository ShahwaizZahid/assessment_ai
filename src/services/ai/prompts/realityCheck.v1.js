import { buildMessages } from '../systemPrompt.js';

const SHAPE = {
  mvpRealityCheck: { narrative: 'string' },
  outcomeThatMatters: { metric: 'string', why: 'string' },
  personas: [{ name: 'string', needs: 'string', cutAndWhy: 'string' }],
};

export function buildRealityCheckPrompt(intakeData) {
  const { system, user } = buildMessages({
    instruction:
      'Write an MVP reality check, the outcome that matters, and 2–3 user personas. Be honest and specific to this idea. Cut scope that does not prove the core loop.',
    shape: SHAPE,
    intakeData,
  });

  return { version: 'v1', role: 'reality_check', system, user };
}
