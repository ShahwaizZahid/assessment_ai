export function buildRisksPrompt(intakeData) {
  return {
    version: 'v1',
    role: 'risk_analysis',
    instruction:
      'Flag market, operational, and financial risks with mitigations, plus validation questions the founder should answer.',
    intakeData,
  };
}
