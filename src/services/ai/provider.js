import * as mock from './providers/mock.js';
import * as openai from './providers/openai.js';
import * as anthropic from './providers/anthropic.js';
import * as gemini from './providers/gemini.js';
import * as groq from './providers/groq.js';
import { ROLE_ENV_KEYS } from './roles.js';
import { ApiError } from '../../utils/ApiError.js';

const adapters = {
  mock,
  openai,
  anthropic,
  gemini,
  groq,
};

export function resolveProviderName(role) {
  const envKey = ROLE_ENV_KEYS[role];
  const name = (process.env[envKey] || 'mock').trim().toLowerCase();
  return name;
}

export function getProvider(role) {
  const name = resolveProviderName(role);
  const adapter = adapters[name];
  if (!adapter?.generate) {
    throw new ApiError(`Unknown AI provider "${name}" for role ${role}`, 500);
  }
  return { name, generate: adapter.generate };
}
