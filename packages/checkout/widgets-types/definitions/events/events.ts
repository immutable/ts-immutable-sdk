/**
 * Enum representing the events emitted by the widgets.
 * @enum {string}
 * @property {string} IMTBL_CONNECT_WIDGET_EVENT - Event emitted when the connect widget should be loaded.
 * @property {string} IMTBL_WALLET_WIDGET_EVENT - Event emitted when the wallet widget should be loaded.
 * @property {string} IMTBL_SWAP_WIDGET_EVENT - Event emitted when the swap widget should be loaded.
 * @property {string} IMTBL_BRIDGE_WIDGET_EVENT - Event emitted when the bridge widget should be loaded.
 * @property {string} IMTBL_BUY_WIDGET_EVENT - Event emitted when the buy widget should be loaded.
 */
export enum IMTBLWidgetEvents {
  IMTBL_CONNECT_WIDGET_EVENT = 'imtbl-connect-widget',
  IMTBL_WALLET_WIDGET_EVENT = 'imtbl-wallet-widget',
  IMTBL_SWAP_WIDGET_EVENT = 'imtbl-swap-widget',
  IMTBL_BRIDGE_WIDGET_EVENT = 'imtbl-bridge-widget',
  IMTBL_BUY_WIDGET_EVENT = 'imtbl-buy-widget',
}
