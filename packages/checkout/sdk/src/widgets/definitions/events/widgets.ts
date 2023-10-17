import { BridgeEventType } from './bridge';
import { ConnectEventType } from './connect';
import { OnRampEventType } from './onramp';
import { OrchestrationEventType } from './orchestration';
import { SwapEventType } from './swap';
import { WalletEventType } from './wallet';
import { SaleEventType } from './sale';

/**
 * Enum representing the events emitted by the widgets.
 */
export enum IMTBLWidgetEvents {
  IMTBL_CONNECT_WIDGET_EVENT = 'imtbl-connect-widget',
  IMTBL_WALLET_WIDGET_EVENT = 'imtbl-wallet-widget',
  IMTBL_SWAP_WIDGET_EVENT = 'imtbl-swap-widget',
  IMTBL_BRIDGE_WIDGET_EVENT = 'imtbl-bridge-widget',
  IMTBL_ONRAMP_WIDGET_EVENT = 'imtbl-onramp-widget',
  IMTBL_SALE_WIDGET_EVENT = 'imtbl-sale-widget',
}

/**
 * Represents all the possible event types that are emitted by the widgets.
 */
export type WidgetEventTypes = OrchestrationEventType
| ConnectEventType
| WalletEventType
| SwapEventType
| BridgeEventType
| OnRampEventType
| SaleEventType;

/**
 * Represents an event emitted by a widget.
 * @template T - The type of data associated with the event.
 * @property {WidgetEventTypes} type - The type of the event.
 * @property {T} data - The data associated with the event.
 */
export type WidgetEvent<T> = {
  type: WidgetEventTypes,
  data: T;
};
