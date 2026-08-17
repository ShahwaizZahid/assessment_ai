export function buildFeatureScopePrompt(intakeData) {
  return {
    version: 'v1',
    role: 'feature_scope',
    instruction:
      'Define a tight beta scope and list what not to build for V1. Tag deferred items V2 or V3.',
    intakeData,
  };
}
