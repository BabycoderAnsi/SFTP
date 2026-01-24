export async function retry(fn, MAX_RETRIES) {
  let lastError;
  try {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
      }
    }
  } catch (error) {
    lastError = error;
    throw lastError;
  }
}
