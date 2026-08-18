import { buildMessages } from '../systemPrompt.js';

const SHAPE = {
  risks: {
    market: { risk: 'string', mitigation: 'string' },
    operational: { risk: 'string', mitigation: 'string' },
    financial: { risk: 'string', mitigation: 'string' },
  },
  validationQuestions: ['string'],
};

export function buildRisksPrompt(intakeData) {
  const { system, user } = buildMessages({
    instruction:
      'Flag market, operational, and financial risks with a mitigation each. Add 3–6 validation questions the founder should answer themselves before building.',
    shape: SHAPE,
    intakeData,
    role: 'risk_analysis',
  });

  return { version: 'v2', role: 'risk_analysis', system, user };
}
