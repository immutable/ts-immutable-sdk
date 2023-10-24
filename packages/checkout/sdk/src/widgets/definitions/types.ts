import { Environment } from '@imtbl/config';
import { WidgetEventTypes } from './events';
import { BridgeWidgetParams, ConnectWidgetParams } from './widgetParameters';

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

export type WidgetParameters = {
  params: ConnectWidgetParams | BridgeWidgetParams;
  config: WidgetConfiguration;
};

export type CreateWidgetParams = {
  [WidgetType.CONNECT]: ConnectWidgetParams,
  [WidgetType.WALLET]: any,
  [WidgetType.SWAP]: any,
  [WidgetType.BRIDGE]: BridgeWidgetParams,
  [WidgetType.ONRAMP]: any,
};

export interface IWidgetsFactory {
  /**
   * Create a new widget instance.
   * @param type widget type to instantiate.
   */
  create<T extends WidgetType>(type: T, params: CreateWidgetParams[T]): Widget;
}

/**
 * Widget interface. Every widget implements this interface.
 */
export interface Widget {
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
  update(widgetParams: WidgetParameters): void;
  /**
   * Add a listener for a widget event.
   * @param event Widget specific event name.
   * @param callback function to execute when the event is received.
   */
  on(type: WidgetEventTypes, callback: (data:any) => void): void;

  /**
   * Removes an event listener for a widget event
   * @param type Widget specific event name
   * @param callback function to execute when the event is received.
   */
  removeListener(type: WidgetEventTypes, callback: (data:any) => void):void;
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
 * Represents the configuration options for the Checkout Widgets.
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

export type WidgetConfiguration = {
  theme?: WidgetTheme;
};
