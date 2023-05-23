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
