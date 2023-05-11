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
