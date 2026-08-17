import Joi from 'joi';
import { ROLES } from './roles.js';
import { ApiError } from '../../utils/ApiError.js';

const personaSchema = Joi.object({
  name: Joi.string().required(),
  needs: Joi.string().required(),
  cutAndWhy: Joi.string().required(),
});

const betaItemSchema = Joi.object({
  item: Joi.string().required(),
  rationale: Joi.string().required(),
});

const notToBuildSchema = Joi.object({
  item: Joi.string().required(),
  phase: Joi.string().valid('V2', 'V3').required(),
  reason: Joi.string().required(),
});

const riskItemSchema = Joi.object({
  risk: Joi.string().required(),
  mitigation: Joi.string().required(),
});

const ROLE_SCHEMAS = {
  [ROLES.REALITY_CHECK]: Joi.object({
    mvpRealityCheck: Joi.object({
      narrative: Joi.string().min(1).required(),
    }).required(),
    outcomeThatMatters: Joi.object({
      metric: Joi.string().min(1).required(),
      why: Joi.string().min(1).required(),
    }).required(),
    personas: Joi.array().items(personaSchema).min(1).required(),
  }).required(),
  [ROLES.FEATURE_SCOPE]: Joi.object({
    betaScope: Joi.array().items(betaItemSchema).min(1).required(),
    notToBuild: Joi.array().items(notToBuildSchema).min(1).required(),
  }).required(),
  [ROLES.TECHNICAL]: Joi.object({
    techStack: Joi.object({
      frontend: Joi.string().min(1).required(),
      backend: Joi.string().min(1).required(),
      payments: Joi.string().min(1).required(),
      hosting: Joi.string().min(1).required(),
      rationale: Joi.string().min(1).required(),
    }).required(),
    investmentTimeline: Joi.object({
      range: Joi.string().min(1).required(),
      weeks: Joi.string().min(1).required(),
      reasoning: Joi.string().min(1).required(),
    }).required(),
    visualArchitecture: Joi.object({
      userFlow: Joi.array().items(Joi.string()).min(1).required(),
      informationArchitecture: Joi.array().items(Joi.string()).min(1).required(),
    }).required(),
  }).required(),
  [ROLES.RISK_ANALYSIS]: Joi.object({
    risks: Joi.object({
      market: riskItemSchema.required(),
      operational: riskItemSchema.required(),
      financial: riskItemSchema.required(),
    }).required(),
    validationQuestions: Joi.array().items(Joi.string()).min(1).required(),
  }).required(),
};

export function extractJsonText(raw) {
  if (raw == null) return '';
  let text = String(raw).trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  return text;
}

export function parseRoleOutput(role, raw) {
  const schema = ROLE_SCHEMAS[role];
  if (!schema) {
    throw new ApiError(`Unknown role for JSON validation: ${role}`, 500);
  }

  let parsed;
  try {
    parsed = JSON.parse(extractJsonText(raw));
  } catch {
    throw new ApiError('Model did not return valid JSON', 502);
  }

  const { error, value } = schema.validate(parsed, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new ApiError(
      `Model JSON failed schema: ${error.details.map((d) => d.message).join(', ')}`,
      502,
    );
  }

  return value;
}
