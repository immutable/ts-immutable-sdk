import { BridgeEventType } from './bridgeEvents';
import { ConnectEventType } from './connectEvents';
import { OnRampEventType } from './onrampEvents';
import { OrchestrationEventType } from './orchestrationEvents';
import { SwapEventType } from './swapEvents';
import { WalletEventType } from './walletEvents';
import { SaleEventType } from './saleEvents';

/**
 * Enum representing the events emitted by the widgets.
 */
export enum IMTBLWidgetEvents {
  IMTBL_CONNECT_WIDGET_EVENT = 'imtbl-connect-widget',
  IMTBL_WALLET_WIDGET_EVENT = 'imtbl-wallet-widget',
  IMTBL_SWAP_WIDGET_EVENT = 'imtbl-swap-widget',
  IMTBL_BRIDGE_WIDGET_EVENT = 'imtbl-bridge-widget',
  IMTBL_ONRAMP_WIDGET_EVENT = 'imtbl-onramp-widget',
  IMTBL_PRIMARY_REVENUE_WIDGET_EVENT = 'imtbl-sale-widget',
}

/**
 * Represents an event emitted by a widget.
 * @template T - The type of data associated with the event.
 * @property {OrchestrationEventType | ConnectEventType | WalletEventType | SwapEventType | BridgeEventType | OnRampEventType | SaleEventType} type - The type of the event.
 * @property {T} data - The data associated with the event.
 */
export type WidgetEvent<T> = {
  type: OrchestrationEventType
  | ConnectEventType
  | WalletEventType
  | SwapEventType
  | BridgeEventType
  | OnRampEventType
  | SaleEventType,
  data: T;
};
