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
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import {
  addAccountsChangedListener,
  addChainChangedListener,
  removeAccountsChangedListener,
  removeChainChangedListener,
  sendProviderUpdatedEvent,
} from 'lib';
import { StrongCheckoutWidgetsConfig, withDefaultWidgetConfigs } from '../lib/withDefaultWidgetConfig';

export abstract class Base<T extends WidgetType> implements Widget<T> {
  protected checkout: Checkout;

  protected targetId?: string;

  protected reactRoot?: Root;

  protected widgetElement?: HTMLElement;

  protected properties: WidgetProperties<T>;

  protected parameters: WidgetParameters[T];

  protected web3Provider: Web3Provider | undefined;

  protected eventHandlers: Map<keyof WidgetEventData[T], Function> = new Map<keyof WidgetEventData[T], Function>();

  protected eventHandlersFunction?: (event: any) => void;

  protected eventTopic: string = '';

  constructor(sdk: Checkout, props: WidgetProperties<T>) {
    const validatedProps = this.getValidatedProperties(props);
    this.parameters = {};

    this.checkout = sdk;
    this.properties = validatedProps;
    this.web3Provider = props?.provider;
    if (this.web3Provider) {
      this.subscribeToEIP1193Events();
      //
    }
    this.setupProviderUpdatedListener();
  }

  unmount() {
    // We want to keep the properties (config and provider) across mounts
    // Clear the parameters on unmount as we don't want to keep them across mounts
    this.parameters = this.getValidatedParameters({});

    this.reactRoot?.unmount();
    document.getElementById(this.targetId as string)?.replaceChildren();
    this.reactRoot = undefined;
  }

  mount(id: string, params: WidgetParameters[T]) {
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

    this.render();
  }

  update(properties: WidgetProperties<T>): void {
    this.properties = this.getValidatedProperties({
      config: {
        ...(this.properties.config ?? {}),
        ...(properties.config ?? {}),
      },
    });

    this.render();
  }

  // eslint-disable-next-line max-len
  addListener<KEventName extends keyof WidgetEventData[T]>(type: KEventName, callback: (data: WidgetEventData[T][KEventName]) => void): void {
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

  // Abstract methods
  protected abstract render(): void;
  protected abstract getValidatedProperties(
    props: WidgetProperties<T>
  ): WidgetProperties<T>;
  protected abstract getValidatedParameters(
    params: WidgetParameters[T]
  ): WidgetParameters[T];

  // Subscribe to PROVIDER_UPDATED events
  private setupProviderUpdatedListener() {
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_WIDGETS_PROVIDER,
      this.handleProviderUpdatedEvent,
    );
  }

  /**
   * Handles the PROVIDER_UPDATED event by and sets web3Provider on widgetRoot
   * This must unsubscribe and re-subscribe to EIP-1193 events on the underlying provider
   * After setting the new web3Provider, render the widget again.
   */
  private handleProviderUpdatedEvent = ((event: CustomEvent) => {
    const widgetRoot = this;
    switch (event.detail.type) {
      case ProviderEventType.PROVIDER_UPDATED: {
        const eventData = event.detail.data as ProviderUpdated;

        if (widgetRoot.web3Provider) {
          // eslint-disable-next-line max-len
          removeAccountsChangedListener(widgetRoot.web3Provider, this.handleProviderUpdate);
          removeChainChangedListener(widgetRoot.web3Provider, this.handleProviderUpdate);
        }
        widgetRoot.web3Provider = eventData.provider;
        this.subscribeToEIP1193Events();
        this.render();
        break;
      }
      default:
    }
  }) as EventListener;

  // Subscribe to EIP-1193 events if we have a web3Provider
  private subscribeToEIP1193Events() {
    const widgetRoot = this;
    if (widgetRoot.web3Provider) {
      addAccountsChangedListener(widgetRoot.web3Provider!, this.handleProviderUpdate);
      addChainChangedListener(widgetRoot.web3Provider!, this.handleProviderUpdate);
    }
  }

  private handleProviderUpdate(e: string[]) {
    console.log('inside handle provider update');
    if (this.web3Provider) {
      console.log('inside handle provider update, got web3provider object');

      const provider = new Web3Provider(this.web3Provider!.provider);
      sendProviderUpdatedEvent({ provider });
    }
  }

  /**
   * Handles EIP-1193 accountsChanged event
   * Sets the widget root provider with a new Web3Provider
  */
  private async handleAccountsChanged(e: string[], widgetRoot: Base<T>) {
    if (e.length === 0) {
      // TODO: when a user disconnects all accounts, send to the Ready To Connect screen
      // Do we just do the same thing as below. Re-wrap the underlying provider
      // eslint-disable-next-line no-param-reassign
      widgetRoot.web3Provider = undefined;
    } else {
      if (!widgetRoot.web3Provider) return;
      // eslint-disable-next-line no-param-reassign
      widgetRoot.web3Provider = new Web3Provider(widgetRoot.web3Provider!.provider);
    }
    // widgetRoot.render();
  }

  /**
   * Handles EIP-1193 chainChanged event
   * Sets the widget root provider with a new Web3Provider
  */
  private handleChainChanged(widgetRoot: Base<T>) {
    // trigger a re-load of the connectLoader so that the widget re loads with a new provider
    if (!widgetRoot.web3Provider) return;

    // eslint-disable-next-line no-param-reassign
    widgetRoot.web3Provider = new Web3Provider(widgetRoot.web3Provider!.provider);
    widgetRoot.render();
  }
}
