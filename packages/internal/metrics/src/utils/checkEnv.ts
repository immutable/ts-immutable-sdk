export function isTestEnvironment() {
  if (typeof process === 'undefined') {
    return false;
  }
  return process.env.JEST_WORKER_ID !== undefined;
}
