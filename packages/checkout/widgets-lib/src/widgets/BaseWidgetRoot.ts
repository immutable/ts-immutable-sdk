/* eslint-disable class-methods-use-this */
import { Root, createRoot } from 'react-dom/client';
import {
  Widget,
  Checkout,
  WidgetProperties,
  WidgetType,
  WidgetEventData,
  IMTBLWidgetEvents,
  ProviderEventType,
  ProviderUpdated,
  WidgetParameters,
  WalletEventType,
  NamedBrowserProvider,
} from '@imtbl/checkout-sdk';
import i18next from 'i18next';
import {
  StrongCheckoutWidgetsConfig,
  withDefaultWidgetConfigs,
} from '../lib/withDefaultWidgetConfig';
import {
  addProviderListenersForWidgetRoot,
  baseWidgetProviderEvent,
} from '../lib';

export abstract class Base<T extends WidgetType> implements Widget<T> {
  protected checkout: Checkout;

  protected targetId?: string;

  protected reactRoot?: Root;

  protected widgetElement?: HTMLElement;

  protected properties: WidgetProperties<T>;

  protected parameters: WidgetParameters[T];

  protected browserProvider: NamedBrowserProvider | undefined;

  protected eventHandlers: Map<keyof WidgetEventData[T], Function> = new Map<
  keyof WidgetEventData[T],
  Function
  >();

  protected eventHandlersFunction?: (event: any) => void;

  protected eventTopic: string = '';

  constructor(sdk: Checkout, props: WidgetProperties<T>) {
    const validatedProps = this.getValidatedProperties(props);
    this.parameters = {} as WidgetParameters[T];

    this.checkout = sdk;
    this.properties = validatedProps;
    this.browserProvider = props?.provider;

    if (this.browserProvider) {
      addProviderListenersForWidgetRoot(this.browserProvider);
    }
    this.setupProviderUpdatedListener();
    this.setupDisconnectProviderListener();
    this.setLanguage(props.config?.language);
  }

  private async setLanguage(language?: string) {
    if (language === null || language === undefined) return;
    await i18next.changeLanguage(language);
    // eslint-disable-next-line no-console
    console.log('Language changed:', language);
  }

  unmount() {
    // We want to keep the properties (config and provider) across mounts
    // Clear the parameters on unmount as we don't want to keep them across mounts
    this.parameters = this.getValidatedParameters({} as WidgetParameters[T]);

    this.reactRoot?.unmount();
    document.getElementById(this.targetId as string)?.replaceChildren();
    this.reactRoot = undefined;
  }

  mount(id: string, params?: WidgetParameters[T]) {
    this.parameters = this.getValidatedParameters({
      ...(this.parameters ?? {}),
      ...(params ?? {}),
    });

    // TODO: log some sort of warning to console if we don't find a target element by it's id
    // return early
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

    this.setLanguage(params?.language);
    this.render();
  }

  update(props: WidgetProperties<T>): void {
    this.properties = this.getValidatedProperties({
      config: {
        ...(this.properties.config ?? {}),
        ...(props.config ?? {}),
      },
    });

    if (props.provider) {
      // eslint-disable-next-line no-console
      console.warn(
        'Updating a widget provider through the update() method is not supported yet',
      );
    }

    const language = props.config?.language;
    this.setLanguage(language);
    this.parameters = this.getValidatedParameters({
      ...(this.parameters ?? {}),
      ...(language ? { language } : {}),
    });

    this.render();
  }

  // eslint-disable-next-line max-len
  addListener<KEventName extends keyof WidgetEventData[T]>(
    type: KEventName,
    callback: (data: WidgetEventData[T][KEventName]) => void,
  ): void {
    this.eventHandlers.set(type, callback);

    if (this.eventHandlersFunction) {
      window.removeEventListener(this.eventTopic, this.eventHandlersFunction);
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_WIDGETS_PROVIDER,
        this.eventHandlersFunction,
      );
    }

    this.eventHandlersFunction = (event: any) => {
      const matchingHandler = this.eventHandlers.get(event.detail.type);
      if (matchingHandler) matchingHandler(event.detail.data);
    };

    window.addEventListener(this.eventTopic, this.eventHandlersFunction);
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_WIDGETS_PROVIDER,
      this.eventHandlersFunction,
    );
  }

  removeListener<KEventName extends keyof WidgetEventData[T]>(
    type: KEventName,
  ): void {
    this.eventHandlers.delete(type);

    if (this.eventHandlersFunction) {
      window.removeEventListener(this.eventTopic, this.eventHandlersFunction);
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_WIDGETS_PROVIDER,
        this.eventHandlersFunction,
      );
    }

    if (this.eventHandlers.size <= 0) return;

    this.eventHandlersFunction = (event: any) => {
      const matchingHandler = this.eventHandlers.get(event.detail.type);
      if (matchingHandler) matchingHandler(event.detail.data);
    };

    window.addEventListener(this.eventTopic, this.eventHandlersFunction);
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_WIDGETS_PROVIDER,
      this.eventHandlersFunction,
    );
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

  // Abstract methods
  protected abstract render(): void;
  protected abstract getValidatedProperties(
    props: WidgetProperties<T>
  ): WidgetProperties<T>;
  protected abstract getValidatedParameters(
    params: WidgetParameters[T]
  ): WidgetParameters[T];

  // Subscribe to PROVIDER_UPDATED events from our widgets
  private setupProviderUpdatedListener() {
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_WIDGETS_PROVIDER,
      this.handleProviderUpdatedEvent,
    );
    const widgetRoot = this;
    window.addEventListener(baseWidgetProviderEvent, () => widgetRoot.handleEIP1193ProviderEvents(widgetRoot));
  }

  private setupDisconnectProviderListener() {
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
      this.handleDisconnectEvent,
    );
  }

  private handleEIP1193ProviderEvents(widgetRoot: Base<T>) {
    if (widgetRoot.browserProvider && widgetRoot.browserProvider.ethereumProvider) {
      // eslint-disable-next-line no-param-reassign
      widgetRoot.browserProvider = new NamedBrowserProvider(
        widgetRoot.browserProvider!.name,
        widgetRoot.browserProvider.ethereumProvider,
      );
    }
    widgetRoot.render();
  }

  /**
   * Handles the PROVIDER_UPDATED event by and sets browserProvider on widgetRoot
   * This must unsubscribe and re-subscribe to EIP-1193 events on the underlying provider
   * After setting the new browserProvider, render the widget again.
   */
  private handleProviderUpdatedEvent = ((event: CustomEvent) => {
    const widgetRoot = this;

    switch (event.detail.type) {
      case ProviderEventType.PROVIDER_UPDATED: {
        const eventData = event.detail.data as ProviderUpdated;
        widgetRoot.browserProvider = eventData.provider;
        this.render();
        break;
      }
      default:
    }
  }) as EventListener;

  /**
   * Handles disconnect event from the wallet widget
   */
  private handleDisconnectEvent = ((event: CustomEvent) => {
    const widgetRoot = this;

    switch (event.detail.type) {
      case WalletEventType.DISCONNECT_WALLET: {
        widgetRoot.browserProvider = undefined;
        this.render();
        break;
      }
      default:
    }
  }) as EventListener;
}
