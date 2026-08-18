export const PROMPT_VERSION = 'v2';

export const ROLES = {
  REALITY_CHECK: 'reality_check',
  FEATURE_SCOPE: 'feature_scope',
  TECHNICAL: 'technical',
  RISK_ANALYSIS: 'risk_analysis',
};

export const ROLE_ENV_KEYS = {
  [ROLES.REALITY_CHECK]: 'AI_PROVIDER_REALITY_CHECK',
  [ROLES.FEATURE_SCOPE]: 'AI_PROVIDER_FEATURE_SCOPE',
  [ROLES.TECHNICAL]: 'AI_PROVIDER_TECHNICAL',
  [ROLES.RISK_ANALYSIS]: 'AI_PROVIDER_RISK_ANALYSIS',
};

export const ROLE_LIST = Object.values(ROLES);
