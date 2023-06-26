export const isDevMode = () => process.env.CHECKOUT_ENVIRONMENT === 'local';

// This works in CI thanks to .github/workflows/publish.yaml build step
export const packageVersion = () => process.env.NEXT_VERSION ?? '0.0.0';
