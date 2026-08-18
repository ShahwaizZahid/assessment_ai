import { buildMessages } from '../systemPrompt.js';

const SHAPE = {
  techStack: {
    frontend: 'string',
    backend: 'string',
    payments: 'string',
    hosting: 'string',
    rationale: 'string',
  },
  investmentTimeline: { range: 'string', weeks: 'string', reasoning: 'string' },
  visualArchitecture: {
    userFlow: ['string'],
    informationArchitecture: ['string'],
  },
};

export function buildTechnicalPrompt(intakeData) {
  const { system, user } = buildMessages({
    instruction:
      'Recommend a tech stack, investment/timeline, user flow steps, and information architecture (screen map) for this MVP. Prefer a small, boring stack.',
    shape: SHAPE,
    intakeData,
    role: 'technical',
  });

  return { version: 'v2', role: 'technical', system, user };
}
