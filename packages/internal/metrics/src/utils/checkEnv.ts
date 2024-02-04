export function isTestEnvironment() {
  if (typeof process === 'undefined') {
    return false;
  }

  // Consider using `ci-info` package for better results, though might fail as not browser safe.
  // Just use process.env.CI for now.
  return process.env.JEST_WORKER_ID !== undefined;
}
