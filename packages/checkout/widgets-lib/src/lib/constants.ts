import { Environment } from '@imtbl/config';
import { CheckoutErrorType, WalletProviderName, WidgetTheme } from '@imtbl/checkout-sdk';
import { RetryType } from './retry';

export const ENV_DEVELOPMENT = 'development' as Environment;

export const NATIVE = 'native';

export const DEFAULT_TOKEN_DECIMALS = 18;
export const DEFAULT_TOKEN_FORMATTING_DECIMALS = 6;
// Used to enforce the number of decimals to show if the number is greater than 1
export const DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS = 2;
// Used to enforce the number of decimals in the input fields
export const DEFAULT_TOKEN_VALIDATION_DECIMALS = DEFAULT_TOKEN_FORMATTING_DECIMALS;

export const ESTIMATE_DEBOUNCE = 700; // ms

export const IMX_TOKEN_SYMBOL = 'IMX';
export const ETH_TOKEN_SYMBOL = 'ETH';

export const ZERO_BALANCE_STRING = '0.0';

export const FAQS_LINK = 'https://support.immutable.com/en/';

/**
 * Delay between retries (milliseconds)
 */
export const DEFAULT_RETRY_DELAY = 10 * 1000;

/**
 * Default retry policy for fetching balances from remote.
 */
export const DEFAULT_BALANCE_RETRY_POLICY: RetryType = {
  retryIntervalMs: DEFAULT_RETRY_DELAY,
  retries: 60, // retry up to DEFAULT_RETRY_DELAY / 1000 minutes
  nonRetryable: (err: any) => err?.data?.code >= 500 || err.type === CheckoutErrorType.GET_ERC20_BALANCE_ERROR,
  nonRetryableSilently: (err: any) => err.type === CheckoutErrorType.WEB3_PROVIDER_ERROR,
};

/**
 * Default retry policy for fetching transactions from remote.
 */
export const DEFAULT_TRANSACTIONS_RETRY_POLICY: RetryType = {
  retryIntervalMs: DEFAULT_RETRY_DELAY,
  retries: 60,
  nonRetryableSilently: (err: any) => !!err,
};

/**
 * Checkout Widget default env
 */
export const DEFAULT_ENV = Environment.SANDBOX;

/**
 * Checkout Widget default theme
 */
export const DEFAULT_THEME = WidgetTheme.DARK;

/**
 * Checkout Widget default provider
 */
export const DEFAULT_PROVIDER = WalletProviderName.METAMASK;

/**
 * Checkout Widget default onramp enabled flag
 */
export const DEFAULT_ON_RAMP_ENABLED = true;

/**
 * Checkout Widget default swap enabled flag
 */
export const DEFAULT_SWAP_ENABLED = true;

/**
 * Checkout Widget default bridge enabled flag
 */
export const DEFAULT_BRIDGE_ENABLED = true;

/**
 * Checkout Widget default refresh quote interval
 */
export const DEFAULT_QUOTE_REFRESH_INTERVAL = 30000;

/**
 * Base URL for the checkout CDN based on the environment.
 */
export const CHECKOUT_CDN_BASE_URL = {
  [ENV_DEVELOPMENT]: 'https://checkout-cdn.dev.immutable.com',
  [Environment.SANDBOX]: 'https://checkout-cdn.sandbox.immutable.com',
  [Environment.PRODUCTION]: 'https://checkout-cdn.immutable.com',
};

/**
 * URL for axelar scan based on the environment
 */
export const AXELAR_SCAN_URL = {
  [ENV_DEVELOPMENT]: 'https://testnet.axelarscan.io/gmp/',
  [Environment.SANDBOX]: 'https://testnet.axelarscan.io/gmp/',
  [Environment.PRODUCTION]: 'https://axelarscan.io/gmp/',
};

/**
 * URL for passport based on environment
 */
export const PASSPORT_URL = {
  [ENV_DEVELOPMENT]: 'https://passport.sandbox.immutable.com/',
  [Environment.SANDBOX]: 'https://passport.sandbox.immutable.com/',
  [Environment.PRODUCTION]: 'https://passport.immutable.com/',
};

export const WITHDRAWAL_CLAIM_GAS_LIMIT = 91000;
