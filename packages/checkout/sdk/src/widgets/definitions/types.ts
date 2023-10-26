import { Environment } from '@imtbl/config';
import {
  BridgeEventType,
  BridgeFailed,
  BridgeSuccess,
  ConnectEventType,
  ConnectionFailed,
  ConnectionSuccess,
  OrchestrationEventType,
  SaleEventType,
  SwapEventType,
  SwapFailed,
  SwapRejected,
  SwapSuccess,
  WalletDisconnectWalletEvent,
  WalletEventType,
  WalletNetworkSwitchEvent,
} from './events';
import {
  BridgeWidgetParams,
  ConnectWidgetParams,
  SwapWidgetParams,
  WalletWidgetParams,
} from './parameters';

/**
 * Enum representing the themes for the widgets.
 */
export enum WidgetTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

/**
 * Enum representing the list of widget types.
 */
export enum WidgetType {
  CONNECT = 'connect',
  WALLET = 'wallet',
  SWAP = 'swap',
  BRIDGE = 'bridge',
  ONRAMP = 'onramp',
}

export type WidgetProperties<T extends WidgetType> = {
  params?: WidgetParameters[T];
  config?: WidgetConfiguration;
};

export type WidgetParameters = {
  [WidgetType.CONNECT]: ConnectWidgetParams,
  [WidgetType.WALLET]: WalletWidgetParams,
  [WidgetType.SWAP]: SwapWidgetParams,
  [WidgetType.BRIDGE]: BridgeWidgetParams,
  [WidgetType.ONRAMP]: any,
};

/**
 * Represents all the possible event types that are emitted by the widgets.
 */
export type WidgetEventTypes = {
  [WidgetType.CONNECT]: ConnectEventType | OrchestrationEventType,
  [WidgetType.WALLET]: WalletEventType | OrchestrationEventType,
  [WidgetType.SWAP]: SwapEventType | OrchestrationEventType,
  [WidgetType.BRIDGE]: BridgeEventType | OrchestrationEventType,
  [WidgetType.ONRAMP]: SaleEventType | OrchestrationEventType,
};

export type WidgetEventData = {
  [WidgetType.CONNECT]: ConnectionSuccess | ConnectionFailed,
  [WidgetType.WALLET]: WalletNetworkSwitchEvent | WalletDisconnectWalletEvent,
  [WidgetType.SWAP]: SwapSuccess | SwapFailed | SwapRejected,
  [WidgetType.BRIDGE]: BridgeSuccess | BridgeFailed;
  [WidgetType.ONRAMP]: any, // TODO
};

/**
 * Represents an event emitted by a widget.
 * @template T - The type of data associated with the event.
 * @property {WidgetEventTypes} type - The type of the event.
 * @property {T} data - The data associated with the event.
 */
export type WidgetEvent<T extends WidgetType> = {
  type: WidgetEventTypes[T],
  data: WidgetEventData[T];
};

export interface IWidgetsFactory {
  /**
   * Create a new widget instance.
   * @param type widget type to instantiate.
   */
  create<T extends WidgetType>(type: T, params: WidgetParameters[T]): Widget<T>;
}

/**
 * Widget interface. Every widget implements this interface.
 */
export interface Widget<T extends WidgetType> {
  /**
   * Mount a widget to a DOM ref element.
   * @param id ID of the DOM element where the widget will be mounted.
   */
  mount(id: string): void;
  /**
   * Unmount a widget without losing state.
   */
  unmount(): void;
  /**
   * Unmount a widget and destroy its state.
   */
  destroy(): void;
  /**
   * Update the widget parameters
   * @param params Widget specific parameters including configuration
   */
  update(params: WidgetProperties<T>): void
  /**
   * Add a listener for a widget event.
   * @param event Widget specific event name.
   * @param callback function to execute when the event is received.
   */
  on(type: WidgetEventTypes[T], callback: (data: any) => void): void

  /**
   * Removes an event listener for a widget event.
   * @param type Widget specific event name.
   */
  removeListener(type: WidgetEventTypes[T]): void
}

/**
 * Represents the version of the Checkout Widgets to use defaults to (0.1.9-alpha)
 * @property {number} major - The major version of the widgets, must specify a major version even if it is 0.
 * @property {number | undefined} minor - The minor version of the widgets, leaving this blank will use the latest minor based on major
 * @property {number | undefined} patch - The patch version of the widgets, leaving this blank will use the latest minor based on minor
 * @property {'alpha' | undefined} prerelease - The prerelease version of the widgets, can only be 'alpha'. Do not use in production.
 * @property {number | undefined} build - The build version of the widgets. Do not use in production.
 *
 * @example
 * { major: 0 } - use default version 0.1.9-alpha
 * { major: 1 } - use version 1.x.x, pickup all new minor and patch versions released
 * { major: 1, minor: 1 } - use version 1.1.x, pickup all new patch versions released
 * { major: 1, minor: 2, patch: 3 } - use version 1.2.3 specifically
 */
export type SemanticVersion = {
  major: number;
  minor?: number;
  patch?: number;
  prerelease?: 'alpha';
  build?: number;
};

/**
 * Represents the global configuration options for the Checkout Widgets.
 * @property {WidgetTheme | undefined} theme - The theme of the Checkout Widget (default: "DARK")
 * @property {Environment | undefined} environment - The environment configuration (default: "SANDBOX")
 * @property {SemanticVersion | undefined} version - The version of the checkout widgets js file to use (default: "0.1.x")
 * @property {boolean | undefined} isOnRampEnabled - Enable on-ramp top-up method (default: "true")
 * @property {boolean | undefined} isSwapEnabled - Enable swap top-up method (default: "true")
 * @property {boolean | undefined} isBridgeEnabled - Enable bridge top-up method (default: "true")
 */
export type CheckoutWidgetsConfig = {
  theme?: WidgetTheme;
  environment?: Environment;
  version?: SemanticVersion;
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
};

/**
 * Represents the local configuration options for the Checkout Widgets.
 * @property {WidgetTheme | undefined} theme - The theme of the Checkout Widget (default: "DARK")
 */
export type WidgetConfiguration = {
  theme?: WidgetTheme;
};
