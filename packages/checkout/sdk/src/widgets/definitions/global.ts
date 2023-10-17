import { WidgetEventTypes } from './events/widgets';
import { Checkout } from '../../sdk';
import {
  CheckoutWidgetsConfig, IWidgetsFactory, Widget, WidgetConfiguration, WidgetType,
} from './types';
import {
  BridgeWidgetProps, ConnectWidgetProps, WidgetProps,
} from './widgetProperties';
/**
 * Declares global interfaces and namespaces for the application.
 * @global
 * @namespace ImmutableCheckoutWidgets
 * */
declare global {
  namespace ImmutableCheckoutWidgets {
    class WidgetsFactory implements IWidgetsFactory {
      constructor(sdk: Checkout, config: CheckoutWidgetsConfig);
      create(type: WidgetType, params: WidgetProps): Widget;
      updateConfig(config: WidgetConfiguration): void;
    }

    class Connect implements Widget {
      constructor(sdk: Checkout, config: WidgetConfiguration, params?: ConnectWidgetProps);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(params: any): void;
      updateConfig(config: WidgetConfiguration): void;
      on(type: WidgetEventTypes, callback: (data: any) => void): void;
    }

    class Bridge implements Widget {
      constructor(sdk: Checkout, config: WidgetConfiguration, params?: BridgeWidgetProps);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(params: any): void;
      updateConfig(config: WidgetConfiguration): void;
      on(type: WidgetEventTypes, callback: (data: any) => void): void;
    }
  }
}
