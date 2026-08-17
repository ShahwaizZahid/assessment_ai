import { ApiError } from '../../../utils/ApiError.js';

export async function generate() {
  throw new ApiError(
    'Anthropic provider is not wired yet. Set the role env to mock or implement this adapter.',
    501,
  );
}
