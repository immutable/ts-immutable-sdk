export async function retry(fn: () => Promise<void>, retryCount = 50, retryDelay = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const attempt = async () => {
      try {
        await fn();
        resolve();
      } catch (error) {
        retries += 1;
        if (retries >= retryCount) {
          reject(error);
        } else {
          setTimeout(attempt, retryDelay);
        }
      }
    };

    attempt();
  });
}
