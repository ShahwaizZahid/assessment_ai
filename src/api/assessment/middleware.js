import Joi from 'joi';
import { ApiError } from '../../utils/ApiError.js';

export const INDUSTRY_TAGS = [
  'SaaS',
  'Marketplace',
  'Social',
  'Health/Fitness',
  'Finance',
  'Education',
  'Food/Bev',
  'E-commerce',
  'Productivity',
  'Real Estate',
  'Travel',
  'Internal Tool',
  'Other',
];

export const PLATFORMS = ['Web app', 'iOS', 'Android', 'Both web + mobile'];

export const REVENUE_MODELS = [
  'Subscriptions',
  'One-time purchase',
  'Freemium',
  'Marketplace commission',
  'Ads',
  'Enterprise licensing',
  'Not sure yet',
];

const optionalString = Joi.string().allow('').optional();

const intakeDataSchema = Joi.object({
  idea: Joi.object({
    appName: optionalString.max(120),
    oneLiner: Joi.string().trim().min(1).max(200).required(),
    elevatorPitch: Joi.string().trim().min(1).max(1000).required(),
    industryTags: Joi.array()
      .items(Joi.string().valid(...INDUSTRY_TAGS))
      .min(1)
      .required(),
  }).required(),
  users: Joi.object({
    primaryUser: Joi.string().trim().min(1).required(),
    secondaryUsers: optionalString,
    businessType: Joi.string().valid('B2B', 'B2C', 'B2B2C').required(),
    expectedUsersYear1: Joi.string().trim().min(1).required(),
  }).required(),
  problem: Joi.object({
    problem: Joi.string().trim().min(1).required(),
    currentSolution: Joi.string().trim().min(1).required(),
    whyNow: optionalString,
  }).required(),
  features: Joi.object({
    coreFeatures: Joi.string().trim().min(1).required(),
    inspirationApps: optionalString,
    platform: Joi.array()
      .items(Joi.string().valid(...PLATFORMS))
      .min(1)
      .required(),
    niceToHave: optionalString,
  }).required(),
  business: Joi.object({
    revenueModels: Joi.array()
      .items(Joi.string().valid(...REVENUE_MODELS))
      .min(1)
      .required(),
    budgetRange: Joi.string().trim().min(1).required(),
    timeline: Joi.string().trim().min(1).required(),
    devTeamStatus: Joi.string().trim().min(1).required(),
    additionalNotes: optionalString,
  }).required(),
}).required();

const createAssessmentSchema = Joi.object({
  intakeData: intakeDataSchema,
}).required();

export const parseAssessmentId = (raw) => {
  const id = Number.parseInt(String(raw), 10);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
};

export const validateCreateAssessment = (req, res, next) => {
  const { error, value } = createAssessmentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(new ApiError(messages.join(', '), 400));
  }

  req.body = value;
  return next();
};

export const validateAssessmentId = (req, res, next) => {
  const id = parseAssessmentId(req.params.id);
  if (id === null) {
    return next(new ApiError('Invalid assessment id', 400));
  }
  req.assessmentId = id;
  return next();
};
