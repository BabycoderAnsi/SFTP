import { log } from '../logging/logging';

export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      log("warn", "retry_attempt", {
        attempt: i + 1,
        maxRetries,
        error: lastError.message,
      });
    }
  }

  log("error", "retry_exhausted", {
    maxRetries,
    lastError: lastError?.message,
  });

  throw lastError;
}
