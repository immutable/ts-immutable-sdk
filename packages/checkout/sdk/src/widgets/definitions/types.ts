import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import {
  BridgeClaimWithdrawalFailed,
  BridgeClaimWithdrawalSuccess,
  BridgeEventType,
  BridgeFailed,
  BridgeTransactionSent,
  ConnectEventType,
  ConnectionFailed,
  ConnectionSuccess,
  OnRampEventType,
  OnRampFailed,
  OnRampSuccess,
  OrchestrationEventType,
  ProviderEventType,
  ProviderUpdated,
  RequestBridgeEvent,
  RequestConnectEvent,
  RequestOnrampEvent,
  RequestSwapEvent,
  RequestWalletEvent,
  SaleEventType,
  SaleFailed,
  SalePaymentMethod,
  SalePaymentToken,
  SaleSuccess,
  SaleTransactionSuccess,
  SwapEventType,
  SwapFailed,
  SwapRejected,
  SwapSuccess,
  WalletConnectProviderChanged,
  WalletDisconnect,
  WalletEventType,
  WalletNetworkSwitch,
  CheckoutEventType,
} from './events';
import {
  BridgeWidgetParams,
  ConnectWidgetParams,
  SwapWidgetParams,
  WalletWidgetParams,
  OnRampWidgetParams,
  CheckoutWidgetParams,
} from './parameters';
import { SaleWidgetParams } from './parameters/sale';
import {
  BridgeWidgetConfiguration,
  ConnectWidgetConfiguration,
  OnrampWidgetConfiguration,
  SaleWidgetConfiguration,
  SwapWidgetConfiguration,
  WalletWidgetConfiguration,
  CheckoutWidgetConfiguration,
} from './configurations';
import { WidgetTheme } from './configurations/theme';

/**
 * Enum representing the list of widget types.
 */
export enum WidgetType {
  CONNECT = 'connect',
  WALLET = 'wallet',
  SWAP = 'swap',
  BRIDGE = 'bridge',
  ONRAMP = 'onramp',
  SALE = 'sale',
  CHECKOUT = 'checkout',
}

/**
 * Widget properties definition for each widget. Used for creating and updating widgets
 */
export type WidgetProperties<T extends WidgetType> = {
  config?: WidgetConfigurations[T];
  provider?: Web3Provider;
};

export type WidgetConfigurations = {
  [WidgetType.CONNECT]: ConnectWidgetConfiguration,
  [WidgetType.WALLET]: WalletWidgetConfiguration,
  [WidgetType.SWAP]: SwapWidgetConfiguration,
  [WidgetType.BRIDGE]: BridgeWidgetConfiguration,
  [WidgetType.ONRAMP]: OnrampWidgetConfiguration,
  [WidgetType.SALE]: SaleWidgetConfiguration,
  [WidgetType.CHECKOUT]: CheckoutWidgetConfiguration,
};

// Mapping each widget type to their parameters
export type WidgetParameters = {
  [WidgetType.CONNECT]: ConnectWidgetParams,
  [WidgetType.WALLET]: WalletWidgetParams,
  [WidgetType.SWAP]: SwapWidgetParams,
  [WidgetType.BRIDGE]: BridgeWidgetParams,
  [WidgetType.ONRAMP]: OnRampWidgetParams,
  [WidgetType.SALE]: SaleWidgetParams,
  [WidgetType.CHECKOUT]: CheckoutWidgetParams,
};

/**
 * Represents all the possible event types that are emitted by the widgets.
 */
export type WidgetEventTypes = {
  [WidgetType.CONNECT]: ConnectEventType | OrchestrationEventType,
  [WidgetType.WALLET]: WalletEventType | OrchestrationEventType,
  [WidgetType.SWAP]: SwapEventType | OrchestrationEventType,
  [WidgetType.BRIDGE]: BridgeEventType | OrchestrationEventType,
  [WidgetType.ONRAMP]: OnRampEventType | OrchestrationEventType,
  [WidgetType.SALE]: SaleEventType | OrchestrationEventType,
  [WidgetType.CHECKOUT]: CheckoutEventType | OrchestrationEventType,
};

// Mapping of Orchestration events to their payloads
type OrchestrationMapping = {
  [OrchestrationEventType.REQUEST_CONNECT]: RequestConnectEvent,
  [OrchestrationEventType.REQUEST_WALLET]: RequestWalletEvent,
  [OrchestrationEventType.REQUEST_SWAP]: RequestSwapEvent,
  [OrchestrationEventType.REQUEST_BRIDGE]: RequestBridgeEvent,
  [OrchestrationEventType.REQUEST_ONRAMP]: RequestOnrampEvent,
};

type ProviderEventMapping = {
  [ProviderEventType.PROVIDER_UPDATED]: ProviderUpdated
};

/**
 * Mapping of widget type, to each of it's events and then each event's payload
 * Update this whenever a new event is created and used by a widget
 * Each widget also has all of the orchestration events
*/
export type WidgetEventData = {
  [WidgetType.CONNECT]: {
    [ConnectEventType.SUCCESS]: ConnectionSuccess,
    [ConnectEventType.FAILURE]: ConnectionFailed,
    [ConnectEventType.CLOSE_WIDGET]: {},
    [ConnectEventType.WALLETCONNECT_PROVIDER_UPDATED]: WalletConnectProviderChanged,
  } & OrchestrationMapping & ProviderEventMapping,

  [WidgetType.WALLET]: {
    [WalletEventType.NETWORK_SWITCH]: WalletNetworkSwitch
    [WalletEventType.DISCONNECT_WALLET]: WalletDisconnect
    [WalletEventType.CLOSE_WIDGET]: {}
  } & OrchestrationMapping & ProviderEventMapping,

  [WidgetType.SWAP]: {
    [SwapEventType.SUCCESS]: SwapSuccess,
    [SwapEventType.FAILURE]: SwapFailed,
    [SwapEventType.REJECTED]: SwapRejected,
    [SwapEventType.CLOSE_WIDGET]: {},
  } & OrchestrationMapping & ProviderEventMapping

  [WidgetType.BRIDGE]: {
    [BridgeEventType.TRANSACTION_SENT]: BridgeTransactionSent,
    [BridgeEventType.FAILURE]: BridgeFailed,
    [BridgeEventType.CLOSE_WIDGET]: {}
    [BridgeEventType.CLAIM_WITHDRAWAL_SUCCESS]: BridgeClaimWithdrawalSuccess
    [BridgeEventType.CLAIM_WITHDRAWAL_FAILURE]: BridgeClaimWithdrawalFailed
  } & OrchestrationMapping & ProviderEventMapping,

  [WidgetType.ONRAMP]: {
    [OnRampEventType.SUCCESS]: OnRampSuccess,
    [OnRampEventType.FAILURE]: OnRampFailed,
    [OnRampEventType.CLOSE_WIDGET]: {},
  } & OrchestrationMapping & ProviderEventMapping,

  [WidgetType.SALE]: {
    [SaleEventType.SUCCESS]: SaleSuccess,
    [SaleEventType.FAILURE]: SaleFailed,
    [SaleEventType.REJECTED]: any,
    [SaleEventType.CLOSE_WIDGET]: {},
    [SaleEventType.TRANSACTION_SUCCESS]: SaleTransactionSuccess,
    [SaleEventType.PAYMENT_METHOD]: SalePaymentMethod,
    [SaleEventType.PAYMENT_TOKEN]: SalePaymentToken,
    [SaleEventType.REQUEST_BRIDGE]: {},
    [SaleEventType.REQUEST_SWAP]: {},
    [SaleEventType.REQUEST_ONRAMP]: {},
  } & OrchestrationMapping & ProviderEventMapping,

  [WidgetType.CHECKOUT]: {
  } & OrchestrationMapping & ProviderEventMapping,
};

/**
 * Represents an event emitted by a widget. The event type should match the event data
 */
/**
 * Represents an event emitted by a widget.
 * @template T - The widget type
 * @template KEventName - The widget event name.
 * @property {KEventName} type - The type of the event.
 * @property {WidgetEventData[T][KEventName]} data - The data associated with the widget event.
 */
export type WidgetEvent<T extends WidgetType, KEventName extends keyof WidgetEventData[T]> = {
  type: KEventName,
  data: WidgetEventData[T][KEventName];
};

/**
 * Represents an event emitted by a widget.
 * @template KEventName - The orchestration event name.
 * @property {KEventName} type
 * @property {OrchestrationMapping[KEventName]} data
 */
export type OrchestrationEvent<KEventName extends keyof OrchestrationMapping> = {
  /** The type of the event. */
  type: KEventName,
  /** The data associated with the event. */
  data: OrchestrationMapping[KEventName];
};

/**
 * Represents an event emitted by a widget.
 * @template KEventName - The provider event name.
 * @property {KEventName} type
 * @property {ProviderEventMapping[KEventName]} data
 */
export type ProviderEvent<KEventName extends keyof ProviderEventMapping> = {
  /** The type of the event. */
  type: KEventName,
  /** The data associated with the event. */
  data: ProviderEventMapping[KEventName];
};

export interface IWidgetsFactory {
  /**
   * Create a new widget instance.
   * @param type widget type to instantiate.
   * @param props widget configurations and provider.
   */
  create<T extends WidgetType>(type: T, props?: WidgetProperties<T>): Widget<T>;
  /**
   * Update the widgets provider instance.
   * @param provider the provider instance to update all widgets.
   */
  updateProvider(provider: Web3Provider): void;
}

/**
 * Widget interface. Every widget implements this interface.
 */
export interface Widget<T extends WidgetType> {
  /**
   * Mount a widget to a DOM ref element.
   * @param id ID of the DOM element where the widget will be mounted.
   * @param params widget parameters.
   */
  mount(id: string, params?: WidgetParameters[T]): void;
  /**
   * Unmount a widget and reset parameters
   */
  unmount(): void;
  /**
   * Update the widget properties
   * @param props Widget specific properties including configuration
   */
  update(props: WidgetProperties<T>): void
  /**
   * Add a listener for a widget event.
   * @param event Widget specific event name.
   * @param callback function to execute when the event is received.
   */
  // eslint-disable-next-line max-len
  addListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName, callback: (data: WidgetEventData[T][KEventName]) => void): void

  /**
   * Removes an event listener for a widget event.
   * @param type Widget specific event name.
   */
  removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
}

/**
 * Represents the version of the Checkout Widgets to use defaults to (0.1.9-alpha)
 * @property {number} major
 * @property {number | undefined} minor
 * @property {number | undefined} patch
 * @property {'alpha' | undefined} prerelease
 * @property {number | undefined} build
 *
 * @example
 * { major: 0 } - use default version 0.1.9-alpha
 * { major: 1 } - use version 1.x.x, pickup all new minor and patch versions released
 * { major: 1, minor: 1 } - use version 1.1.x, pickup all new patch versions released
 * { major: 1, minor: 2, patch: 3 } - use version 1.2.3 specifically
 */
export type SemanticVersion = {
  /** The major version of the widgets, must specify a major version even if it is 0. */
  major: number;
  /** The minor version of the widgets, leaving this blank will use the latest minor based on major */
  minor?: number;
  /** The patch version of the widgets, leaving this blank will use the latest minor based on minor */
  patch?: number;
  /** The prerelease version of the widgets, can only be 'alpha'. Do not use in production. */
  prerelease?: 'alpha';
  /** The build version of the widgets. Do not use in production. */
  build?: number;
};

/**
 * Represents the global configuration options for the Checkout Widgets.
 * @property {WidgetTheme | undefined} theme
 * @property {Environment | undefined} environment
 * @property {SemanticVersion | undefined} version
 * @property {boolean | undefined} isOnRampEnabled
 * @property {boolean | undefined} isSwapEnabled
 * @property {boolean | undefined} isBridgeEnabled
 */
export type CheckoutWidgetsConfig = {
  /** The theme of the Checkout Widget (default: "DARK") */
  theme?: WidgetTheme;
  /** The environment configuration (default: "SANDBOX") */
  environment?: Environment;
  /** The version of the checkout widgets js file to use (default: "0.1.x") */
  version?: SemanticVersion;
  /** Enable on-ramp top-up method (default: "true") */
  isOnRampEnabled?: boolean;
  /** Enable swap top-up method (default: "true") */
  isSwapEnabled?: boolean;
  /** Enable bridge top-up method (default: "true") */
  isBridgeEnabled?: boolean;
};
