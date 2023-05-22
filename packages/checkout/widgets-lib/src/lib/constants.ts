import { Environment } from '@imtbl/config';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';

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
export const DEFAULT_PROVIDER = ConnectionProviders.METAMASK;

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
