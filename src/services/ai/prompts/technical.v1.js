export function buildTechnicalPrompt(intakeData) {
  return {
    version: 'v1',
    role: 'technical',
    instruction:
      'Recommend a tech stack, investment/timeline range, user flow, and information architecture for this MVP.',
    intakeData,
  };
}
