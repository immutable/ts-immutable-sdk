/* eslint-disable class-methods-use-this */
import { Root, createRoot } from 'react-dom/client';
import {
  Widget,
  Checkout,
  WidgetProperties,
  WidgetType,
  WidgetEventData,
} from '@imtbl/checkout-sdk';
import { StrongCheckoutWidgetsConfig, withDefaultWidgetConfigs } from '../lib/withDefaultWidgetConfig';

export abstract class Base<T extends WidgetType> implements Widget<T> {
  protected checkout: Checkout;

  protected targetId?: string;

  protected reactRoot?: Root;

  protected widgetElement?: HTMLElement;

  protected properties: WidgetProperties<T>;

  protected eventHandlers: Map<keyof WidgetEventData[T], Function> = new Map<keyof WidgetEventData[T], Function>();

  protected eventHandlersFunction?: (event: any) => void;

  protected eventTopic: string = '';

  constructor(sdk: Checkout, props: WidgetProperties<T>) {
    const validatedProps = this.getValidatedProperties(props);

    this.checkout = sdk;
    this.properties = validatedProps;
  }

  unmount() {
    this.reactRoot?.unmount();
    document.getElementById(this.targetId as string)?.replaceChildren();
    this.reactRoot = undefined;
  }

  destroy(): void {
    this.properties = this.getValidatedProperties({
      params: {},
      config: {},
    });
    this.reactRoot?.unmount();
    document.getElementById(this.targetId as string)?.replaceChildren();
    this.reactRoot = undefined;
  }

  mount(id: string) {
    this.targetId = id;
    const targetElement = document.getElementById(id);

    if (!this.widgetElement) {
      this.widgetElement = document.createElement('div');
    }

    if (targetElement?.children.length === 0) {
      targetElement?.appendChild(this.widgetElement);
    } else {
      targetElement?.replaceChildren(this.widgetElement);
    }

    if (!this.reactRoot && targetElement && this.widgetElement) {
      this.reactRoot = createRoot(this.widgetElement);
    }

    this.render();
  }

  update(properties: WidgetProperties<T>): void {
    this.properties = this.getValidatedProperties({
      params: {
        ...(this.properties.params ?? {}),
        ...(properties.params ?? {}),
      },
      config: {
        ...(this.properties.config ?? {}),
        ...(properties.config ?? {}),
      },
    });

    this.render();
  }

  // eslint-disable-next-line max-len
  on<KEventName extends keyof WidgetEventData[T]>(type: KEventName, callback: (data: WidgetEventData[T][KEventName]) => void): void {
    this.eventHandlers.set(type, callback);

    if (this.eventHandlersFunction) {
      window.removeEventListener(this.eventTopic, this.eventHandlersFunction);
    }

    this.eventHandlersFunction = (event: any) => {
      const matchingHandler = this.eventHandlers.get(event.detail.type);
      if (matchingHandler) matchingHandler(event.detail.data);
    };
    window.addEventListener(this.eventTopic, this.eventHandlersFunction);
  }

  removeListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName): void {
    this.eventHandlers.delete(type);

    if (this.eventHandlersFunction) {
      window.removeEventListener(this.eventTopic, this.eventHandlersFunction);
    }

    if (this.eventHandlers.size <= 0) return;

    this.eventHandlersFunction = (event: any) => {
      const matchingHandler = this.eventHandlers.get(event.detail.type);
      if (matchingHandler) matchingHandler(event.detail.data);
    };
    window.addEventListener(this.eventTopic, this.eventHandlersFunction);
  }

  protected strongConfig(): StrongCheckoutWidgetsConfig {
    return withDefaultWidgetConfigs({
      theme: this.properties.config?.theme,
      environment: this.checkout.config.environment,
      isOnRampEnabled: this.checkout.config.isOnRampEnabled,
      isSwapEnabled: this.checkout.config.isSwapEnabled,
      isBridgeEnabled: this.checkout.config.isBridgeEnabled,
    });
  }

  protected abstract render(): void;
  protected abstract getValidatedProperties(props: WidgetProperties<T>): WidgetProperties<T>;
}
