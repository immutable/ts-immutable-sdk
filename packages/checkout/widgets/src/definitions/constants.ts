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
