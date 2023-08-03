import { Environment } from '@imtbl/config';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { WidgetTheme } from './types';

export const NATIVE = 'NATIVE';
export const DEFAULT_TOKEN_DECIMALS = 18;
export const DEFAULT_TOKEN_FORMATTING_DECIMALS = 6;
export const DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS = 2;
export const IMX_TOKEN_SYMBOL = 'IMX';
export const ETH_TOKEN_SYMBOL = 'ETH';
export const ZERO_BALANCE_STRING = '0.0';
export const IMX_ADDRESS_ZKEVM = '0x0000000000000000000000000000000000001010';

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
// TODO https://immutable.atlassian.net/browse/WT-1509
export const DEFAULT_ON_RAMP_ENABLED = false;

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
