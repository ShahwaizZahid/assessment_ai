const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Provider timed out after ${ms}ms`)), ms);
    }),
  ]);

/**
 * Retry a provider call with timeout and exponential backoff.
 * @param {() => Promise<unknown>} fn
 * @param {{ timeoutMs?: number, retries?: number, baseDelayMs?: number }} [options]
 */
export async function withRetry(fn, options = {}) {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const retries = options.retries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 400;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }
  throw lastError;
}
