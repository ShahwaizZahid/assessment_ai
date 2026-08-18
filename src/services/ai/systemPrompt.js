const JSON_ONLY =
  'Output ONLY valid JSON matching the schema provided. No prose outside JSON. No markdown, no code fences, no commentary.';

const asText = (value) => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return String(value);
};

export function formatIntake(intakeData = {}) {
  const idea = intakeData.idea ?? {};
  const users = intakeData.users ?? {};
  const problem = intakeData.problem ?? {};
  const features = intakeData.features ?? {};
  const business = intakeData.business ?? {};

  return [
    "Founder's MVP Intake:",
    '',
    'IDEA',
    `App name: ${asText(idea.appName)}`,
    `One-liner: ${asText(idea.oneLiner)}`,
    `Elevator pitch: ${asText(idea.elevatorPitch)}`,
    `Industry: ${asText(idea.industryTags)}`,
    '',
    'USERS',
    `Primary user: ${asText(users.primaryUser)}`,
    `Secondary users: ${asText(users.secondaryUsers)}`,
    `Business type: ${asText(users.businessType)}`,
    `Expected users (Year 1): ${asText(users.expectedUsersYear1)}`,
    '',
    'PROBLEM',
    `Problem: ${asText(problem.problem)}`,
    `Current solutions: ${asText(problem.currentSolution)}`,
    `Why now: ${asText(problem.whyNow)}`,
    '',
    'FEATURES',
    `Core features: ${asText(features.coreFeatures)}`,
    `Inspiration apps: ${asText(features.inspirationApps)}`,
    `Platform: ${asText(features.platform)}`,
    `Nice-to-have: ${asText(features.niceToHave)}`,
    '',
    'BUSINESS',
    `Revenue model: ${asText(business.revenueModels)}`,
    `Budget range: ${asText(business.budgetRange)}`,
    `Timeline: ${asText(business.timeline)}`,
    `Dev team status: ${asText(business.devTeamStatus)}`,
    `Additional notes: ${asText(business.additionalNotes)}`,
  ].join('\n');
}

export function buildMessages({ instruction, shape, intakeData, role }) {
  const system = [
    'You are a senior startup/product strategist and technical architect who has',
    'scoped 300+ MVPs for early-stage founders. You give blunt, realistic,',
    'non-salesy assessments — you actively push back on scope creep and call out',
    'when an idea is harder than the founder thinks. You are not trying to sell',
    'anything; you are trying to save the founder time and money.',
    '',
    "Given a founder's raw answers to a 5-step intake form, produce a structured",
    'MVP assessment. Follow these rules:',
    '- Be specific to THEIR idea, not generic startup advice. Reference details',
    '  they gave you (their exact user type, industry, features).',
    '- Every recommendation needs a one-line "why" — no unexplained advice.',
    '- Be honest about hard truths (chicken-and-egg problems, unit economics,',
    '  regulatory risk, technical complexity) — don\'t sugarcoat.',
    '- Cost and timeline estimates must be realistic for a small dev agency',
    '  (2-5 person team), not enterprise consulting numbers.',
    `- ${JSON_ONLY}`,
    '',
    `You are filling ONLY this role: ${role}`,
    'Do not invent other sections.',
    '',
    'Required JSON shape:',
    JSON.stringify(shape, null, 2),
  ].join('\n');

  const user = [
    instruction,
    formatIntake(intakeData),
    'Generate JSON for your assigned role only, per the schema.',
  ].join('\n\n');

  return { system, user };
}
