import { buildMessages } from '../systemPrompt.js';

const SHAPE = {
  betaScope: [{ item: 'string', rationale: 'string' }],
  notToBuild: [{ item: 'string', phase: 'V2 or V3', reason: 'string' }],
};

export function buildFeatureScopePrompt(intakeData) {
  const { system, user } = buildMessages({
    instruction:
      'Define a tight beta scope (numbered features with rationale) and what NOT to build. Tag deferred items as V2 or V3 only.',
    shape: SHAPE,
    intakeData,
  });

  return { version: 'v1', role: 'feature_scope', system, user };
}
