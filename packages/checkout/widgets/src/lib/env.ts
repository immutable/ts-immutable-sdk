export const isDevMode = () => process.env.CHECKOUT_ENVIRONMENT === 'local';

// This works in CI thanks to .github/workflows/publish.yaml build step
// Fallback only uses major so it is handled by jsdeliver.
export const packageVersion = () => process.env.NEXT_VERSION ?? '0';
