import { ApiError } from '../../../utils/ApiError.js';

export function requireApiKey(envName) {
  const value = (process.env[envName] || '').trim();
  if (!value) {
    throw new ApiError(`${envName} is not set`, 500);
  }
  return value;
}

export function requirePrompt(prompt) {
  if (!prompt?.system || !prompt?.user) {
    throw new ApiError('Prompt is missing system or user text', 500);
  }
  return prompt;
}
