import { Environment } from '@imtbl/config';

// Mirrors `ENV_DEVELOPMENT` in `@imtbl/checkout-sdk`'s `env/constants.ts`.
// `Environment` only publicly exposes SANDBOX + PRODUCTION; the SDK selects
// devnet via `CheckoutConfiguration.isDevelopment` (set from CHECKOUT_DEV_MODE).
// Cast lets us key the same lookup map without changing the public enum.
export const ENV_DEVELOPMENT = 'development' as Environment;

export const PRIMARY_SALES_API_BASE_URL = {
  [ENV_DEVELOPMENT]: 'https://api.dev.immutable.com/v1/primary-sales',
  [Environment.SANDBOX]: 'https://api.sandbox.immutable.com/v1/primary-sales',
  [Environment.PRODUCTION]: 'https://api.immutable.com/v1/primary-sales',
};
