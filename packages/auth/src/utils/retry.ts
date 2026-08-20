export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Full jitter on the backoff so that when the token endpoint fails for many clients
// at once, their retries spread out instead of synchronising into a thundering herd.
export function backoffWithJitter(baseDelayMs: number, attemptNumber: number): number {
  const base = baseDelayMs * attemptNumber;
  return base * (0.5 + Math.random() * 0.5);
}
