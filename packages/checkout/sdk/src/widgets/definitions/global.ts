import { Checkout } from '../../sdk';
import {
  CheckoutWidgetsConfig,
  WidgetParameters,
  IWidgetsFactory,
  Widget,
  WidgetProperties,
  WidgetType,
  WidgetEventTypes,
} from './types';

/**
 * Declares global interfaces and namespaces for the application.
 * @global
 * @namespace ImmutableCheckoutWidgets
 * */
declare global {
  namespace ImmutableCheckoutWidgets {
    class WidgetsFactory implements IWidgetsFactory {
      constructor(sdk: Checkout, config: CheckoutWidgetsConfig);
      create<T extends WidgetType>(type: T, params: WidgetParameters[T]): Widget<T>;
    }

    class Connect<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(props: WidgetProperties<T>): void;
      on(type: WidgetEventTypes[T], callback: (data: any) => void): void;
      removeListener(type: WidgetEventTypes[T]): void;
    }

    class Bridge<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(props: WidgetProperties<T>): void;
      on(type: WidgetEventTypes[T], callback: (data: any) => void): void;
      removeListener(type: WidgetEventTypes[T]): void;
    }

    class Wallet<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(props: WidgetProperties<T>): void;
      on(type: WidgetEventTypes[T], callback: (data: any) => void): void;
      removeListener(type: WidgetEventTypes[T]): void;
    }
  }
}
