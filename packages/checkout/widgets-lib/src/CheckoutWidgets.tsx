/* eslint-disable class-methods-use-this */
import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import {
  Widget, CheckoutWidgetsConfig, Checkout, ConnectEventType,
  ConnectTargetLayer,
  ConnectWidgetParams,
  BridgeWidgetParams,
  WalletProviderName,
  WidgetConfiguration,
  OrchestrationEventType,
  BridgeEventType,
} from '@imtbl/checkout-sdk';
import { ConnectWidget } from './widgets/connect/ConnectWidget';
import { CustomAnalyticsProvider } from './context/analytics-provider/CustomAnalyticsProvider';
import { StrongCheckoutWidgetsConfig, withDefaultWidgetConfigs } from './lib/withDefaultWidgetConfig';
import { ConnectLoader, ConnectLoaderParams } from './components/ConnectLoader/ConnectLoader';
import { BridgeWidget } from './widgets/bridge/BridgeWidget';
import { sendBridgeWidgetCloseEvent } from './widgets/bridge/BridgeWidgetEvents';

class BaseWidget {
  checkout: Checkout;

  targetId?: string;

  reactRoot?: Root;

  widgetElement?: HTMLElement;

  config: StrongCheckoutWidgetsConfig;

  constructor(sdk: Checkout, config: WidgetConfiguration) {
    this.checkout = sdk;
    this.config = withDefaultWidgetConfigs({ ...this.checkout.config, ...config });
  }

  /**
   * Remove the element from the DOM but keep element in memory.
   * Keeps the state of the widget application for re-mounting later
   */
  unmount() {
    document.getElementById(this.targetId as string)?.replaceChildren();
  }

  /**
   * Remove the element from the DOM and destroy the root applcation
   */
  destroy(): void {
    this.reactRoot?.unmount();
    document.getElementById(this.targetId as string)?.replaceChildren();
    this.reactRoot = undefined;
  }
}

export class Connect extends BaseWidget implements Widget {
  connectParams: ConnectWidgetParams;

  eventHandlers: Map<ConnectEventType, Function> = new Map<ConnectEventType, Function>();

  connectEventsHandler?: (event: any) => void;

  constructor(sdk: Checkout, config: CheckoutWidgetsConfig, params: ConnectWidgetParams) {
    super(sdk, config);
    this.connectParams = params;
  }

  private renderConnectWidget() {
    if (this.reactRoot) {
      this.reactRoot.render(
        <React.StrictMode>
          <CustomAnalyticsProvider
            widgetConfig={this.config!}
          >
            <ConnectWidget
              config={this.config!}
              {...this.connectParams}
            />
          </CustomAnalyticsProvider>
        </React.StrictMode>,
      );
    }
  }

  mount(id: string) {
    this.targetId = id;
    const targetElement = document.getElementById(id);

    if (!this.widgetElement) {
      this.widgetElement = document.createElement('div');
    }
    // const shadowRoot = this.connectElement.attachShadow({ mode: 'open' });

    if (targetElement?.children.length === 0) {
      targetElement?.appendChild(this.widgetElement);
    } else {
      targetElement?.replaceChildren(this.widgetElement);
    }

    if (!this.reactRoot && targetElement && this.widgetElement) {
      this.reactRoot = createRoot(this.widgetElement);
    }

    this.renderConnectWidget();
  }

  update(params: any) {
    this.connectParams = params;
    this.renderConnectWidget();
  }

  updateConfig(config: WidgetConfiguration) {
    this.config = withDefaultWidgetConfigs({ ...this.config, ...config });
    this.renderConnectWidget();
  }

  on(event: ConnectEventType | OrchestrationEventType, callback: (data: any) => void) {
    this.eventHandlers.set(event as ConnectEventType, callback);

    // we need to remove the main window event listner for this widget with old event handlers
    if (this.connectEventsHandler) {
      window.removeEventListener('imtbl-connect-widget', this.connectEventsHandler);
    }

    // set up new main handler with all of the event handlers
    this.connectEventsHandler = (connectWidgetEvent: any) => {
      const matchingHandler = this.eventHandlers.get(connectWidgetEvent.detail.type);
      if (matchingHandler) {
        matchingHandler(connectWidgetEvent.detail.data);
      }
    };

    // add new main window event listner with the new event handlers
    window.addEventListener('imtbl-connect-widget', this.connectEventsHandler);
  }

  removeListener(type: ConnectEventType | OrchestrationEventType, callback: (data: any) => void): void {
    // To be implemented
    console.log('To be implemented ', type, callback);
  }
}

export class Bridge extends BaseWidget implements Widget {
  bridgeParams: BridgeWidgetParams;

  constructor(sdk: Checkout, config: CheckoutWidgetsConfig, params: BridgeWidgetParams) {
    super(sdk, config);
    this.bridgeParams = params;
  }

  private renderBridgeWidget() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProvider: this.bridgeParams.walletProvider ?? WalletProviderName.METAMASK,
      web3Provider: undefined,
      passport: undefined,
      allowedChains: [
        11155111,
      ],
    };
    if (this.reactRoot) {
      this.reactRoot.render(
        <React.StrictMode>
          <CustomAnalyticsProvider
            widgetConfig={this.config!}
          >
            <ConnectLoader
              params={connectLoaderParams}
              closeEvent={() => sendBridgeWidgetCloseEvent(window)}
              widgetConfig={this.config!}
            >
              <BridgeWidget
                {...this.bridgeParams}
                config={this.config!}
              />
            </ConnectLoader>
          </CustomAnalyticsProvider>
        </React.StrictMode>,
      );
    }
  }

  mount(id: string) {
    this.targetId = id;
    const targetElement = document.getElementById(id);

    if (!this.widgetElement) {
      this.widgetElement = document.createElement('div');
    }
    // const shadowRoot = this.bridgeElement.attachShadow({ mode: 'open' });

    if (targetElement?.children.length === 0) {
      targetElement?.appendChild(this.widgetElement);
    } else {
      targetElement?.replaceChildren(this.widgetElement);
    }

    if (!this.reactRoot && targetElement && this.widgetElement) {
      this.reactRoot = createRoot(this.widgetElement);
    }

    this.renderBridgeWidget();
  }

  update(params: any) {
    this.bridgeParams = params.params;
    this.config = params.config;
    this.renderBridgeWidget();
  }

  updateConfig(config: WidgetConfiguration) {
    this.config = withDefaultWidgetConfigs({ ...this.config, ...config });
    this.renderBridgeWidget();
  }

  on(event: BridgeEventType | OrchestrationEventType, callback: (data:any) => void) {
    // To be implemented
    console.log(`event ${event} with callback ${callback}`);
  }

  removeListener(type: BridgeEventType | OrchestrationEventType, callback: (data: any) => void): void {
    // To be implemented
    console.log('To be implemented ', type, callback);
  }
}
