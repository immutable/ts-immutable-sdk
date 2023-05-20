import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

/**
 * Enum representing the networks supported by Checkout.
 */
export enum Network {
  ETHEREUM = 'Ethereum',
  SEPOLIA = 'Sepolia',
  IMTBL_ZKEVM_TESTNET = 'Immutable zkEVM Testnet',
  IMTBL_ZKEVM_DEVNET = 'Immutable zkEVM Devnet',
  POLYGON_ZKEVM_TESTNET = 'Polygon zkEVM Testnet',
  POLYGON_ZKEVM = 'Polygon zkEVM',
}

/**
 * Enum representing the themes for the Checkout widgets.
 */
export enum WidgetTheme {
  LIGHT = 'light',
  DARK = 'dark',
  CUSTOM = 'custom',
}

/**
 * Enum representing the default Web3 providers supported by the Checkout widgets.
 */
export enum WidgetConnectionProviders {
  METAMASK = 'metamask',
}

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

/**
 * Enum representing list of Checkout Widgets DOM tags.
 */
export enum CheckoutWidgetTagNames {
  CONNECT = 'imtbl-connect',
  WALLET = 'imtbl-wallet',
  SWAP = 'imtbl-swap',
  BUY = 'imtbl-buy',
  BRIDGE = 'imtbl-bridge',
  EXAMPLE = 'imtbl-example',
}
