import { Web3Provider } from '@ethersproject/providers';
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

interface WidgetsFactoryCreate {
  (type: WidgetType.CHECKOUT, props?: WidgetProperties<WidgetType.CHECKOUT>): Widget<WidgetType.CHECKOUT>;

  /** @deprecated
   * Use WidgetType.CHECKOUT instead, see https://docs.immutable.com/products/zkEVM/checkout/widget/setup
   * */
  <T extends Exclude<WidgetType, WidgetType.CHECKOUT>>(type: T, props?: WidgetProperties<T>): Widget<T>;
}

/**
 * Declares global interfaces and namespaces for the application.
 * @global
 * @namespace ImmutableCheckoutWidgets
 * */
declare global {
  namespace ImmutableCheckoutWidgets {
    class WidgetsFactory implements IWidgetsFactory {
      constructor(sdk: Checkout, config: CheckoutWidgetsConfig);
      create: WidgetsFactoryCreate;
      updateProvider(provider: Web3Provider): void;
    }

    class Connect<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string, params?: WidgetParameters[T]): void;
      unmount(): void;
      update(props: WidgetProperties<T>): void;
      addListener<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class Bridge<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string, params?: WidgetParameters[T]): void;
      unmount(): void;
      update(props: WidgetProperties<T>): void;
      addListener<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class Wallet<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string, params?: WidgetParameters[T]): void;
      unmount(): void;
      update(props: WidgetProperties<T>): void;
      addListener<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class Swap<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string, params?: WidgetParameters[T]): void;
      unmount(): void;
      update(props: WidgetProperties<T>): void;
      addListener<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class OnRamp<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string, params?: WidgetParameters[T]): void;
      unmount(): void;
      update(props: WidgetProperties<T>): void;
      addListener<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }

    class Sale<T extends WidgetType> implements Widget<T> {
      constructor(sdk: Checkout, props: WidgetProperties<T>);
      mount(id: string, params?: WidgetParameters[T]): void;
      unmount(): void;
      update(props: WidgetProperties<T>): void;
      addListener<KEventName extends keyof WidgetEventData[T]>(
        type: KEventName,
        callback: (data: WidgetEventData[T][KEventName]) => void
      ): void;
      removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void;
    }
  }
}
