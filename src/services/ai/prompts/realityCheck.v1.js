export function buildRealityCheckPrompt(intakeData) {
  return {
    version: 'v1',
    role: 'reality_check',
    instruction:
      'Write an MVP reality check, the outcome that matters, and user personas. Be honest and specific to this idea.',
    intakeData,
  };
}
