import { BridgeEventType } from './bridgeEvents';
import { BuyEventType } from './buyEvents';
import { ConnectEventType } from './connectEvents';
import { OrchestrationEventType } from './orchestrationEvents';
import { SwapEventType } from './swapEvents';
import { WalletEventType } from './walletEvents';

/**
 * Enum representing the events emitted by the widgets.
 */
export enum IMTBLWidgetEvents {
  IMTBL_CONNECT_WIDGET_EVENT = 'imtbl-connect-widget',
  IMTBL_WALLET_WIDGET_EVENT = 'imtbl-wallet-widget',
  IMTBL_SWAP_WIDGET_EVENT = 'imtbl-swap-widget',
  IMTBL_BRIDGE_WIDGET_EVENT = 'imtbl-bridge-widget',
  IMTBL_BUY_WIDGET_EVENT = 'imtbl-buy-widget',
  IMTBL_ONRAMP_WIDGET_EVENT = 'imtbl-onramp-widget',
}

/**
 * Represents an event object emitted by any of the widgets.
 * @property {OrchestrationEventType | ConnectEventType | WalletEventType | SwapEventType | BridgeEventType | BuyEventType} type - The type of the event.
 * @property {T} data - The data contained in the event.
 */
export type WidgetEvent<T> = {
  type: OrchestrationEventType | ConnectEventType | WalletEventType | SwapEventType | BridgeEventType | BuyEventType,
  data: T;
};
