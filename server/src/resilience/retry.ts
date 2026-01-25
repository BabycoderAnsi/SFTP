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
    }
  }

  throw lastError;
}
