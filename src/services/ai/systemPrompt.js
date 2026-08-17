const JSON_ONLY =
  'Reply with a single JSON object only. No markdown, no code fences, no commentary.';

export function buildMessages({ instruction, shape, intakeData }) {
  const system = [
    'You are an experienced MVP product strategist at a software agency.',
    'Be honest, specific to the intake, and avoid generic filler.',
    JSON_ONLY,
    'Required JSON shape:',
    JSON.stringify(shape, null, 2),
  ].join('\n');

  const user = [
    instruction,
    'Intake data:',
    JSON.stringify(intakeData ?? {}, null, 2),
  ].join('\n\n');

  return { system, user };
}
