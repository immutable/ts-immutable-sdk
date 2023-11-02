import { Checkout } from '../../sdk';
import {
  CheckoutWidgetsConfig,
  WidgetParameters,
  IWidgetsFactory,
  Widget,
  WidgetProperties,
  WidgetType,
  WidgetEventData,
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
      // eslint-disable-next-line max-len
      on<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class Bridge<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(props: WidgetProperties<T>): void;
      // eslint-disable-next-line max-len
      on<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class Wallet<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(props: WidgetProperties<T>): void;
      // eslint-disable-next-line max-len
      on<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class Swap<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(props: WidgetProperties<T>): void;
      // eslint-disable-next-line max-len
      on<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class OnRamp<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(props: WidgetProperties<T>): void;
      // eslint-disable-next-line max-len
      on<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class Sale<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string): void;
      unmount(): void;
      destroy(): void;
      update(props: WidgetProperties<T>): void;
      // eslint-disable-next-line max-len
      on<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }
  }
}
