/**
 * Network enum representing the available networks for the Checkout Widgets.
 * @enum {string}
 * @readonly
 */
export enum Network {
  ETHEREUM = 'Ethereum',
  GOERLI = 'Goerli',
  POLYGON = 'Polygon',
}

/**
 * WidgetTheme enum representing the available themes for the Checkout Widgets.
 * @enum {string}
 * @readonly
 */
export enum WidgetTheme {
  LIGHT = 'light',
  DARK = 'dark',
  CUSTOM = 'custom',
}

export { ConnectionProviders } from '@imtbl/checkout-sdk-web';
