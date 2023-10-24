import { Checkout } from '../../sdk';
import {
  CheckoutWidgetsConfig, CreateWidgetParams, IWidgetsFactory, Widget, WidgetConfiguration, WidgetParameters, WidgetType,
} from './types';
import {
  BridgeWidgetParams, ConnectWidgetParams,
} from './parameters';
import { WidgetEventTypes } from './events';
/**
 * Declares global interfaces and namespaces for the application.
 * @global
 * @namespace ImmutableCheckoutWidgets
 * */
declare global {
  namespace ImmutableCheckoutWidgets {
    class WidgetsFactory implements IWidgetsFactory {
      constructor(sdk: Checkout, config: CheckoutWidgetsConfig);
      create<T extends WidgetType>(type: T, params: CreateWidgetParams[T]): Widget;
    }

    class Connect implements Widget {
      constructor(sdk: Checkout, config: WidgetConfiguration, params?: ConnectWidgetParams);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(params: WidgetParameters): void;
      on(type: WidgetEventTypes, callback: (data: any) => void): void;
      removeListener(type: WidgetEventTypes, callback: (data: any) => void): void;
    }

    class Bridge implements Widget {
      constructor(sdk: Checkout, config: WidgetConfiguration, params?: BridgeWidgetParams);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(params: WidgetParameters): void;
      on(type: WidgetEventTypes, callback: (data: any) => void): void;
      removeListener(type: WidgetEventTypes, callback: (data: any) => void): void;
    }
  }
}
