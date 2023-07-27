import ReactDOM from 'react-dom/client';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '@imtbl/checkout-sdk';
import { StrongCheckoutWidgetsConfig, withDefaultWidgetConfigs } from '../lib/withDefaultWidgetConfig';

export abstract class ImmutableWebComponent extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  widgetConfig?: StrongCheckoutWidgetsConfig;

  provider: Web3Provider | undefined = undefined;

  checkoutConfig: CheckoutConfiguration | undefined;

  static get observedAttributes() {
    return ['widgetConfig'];
  }

  setProvider(provider: Web3Provider): void {
    this.provider = provider;
    this.renderWidget();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'widgetConfig') {
      this.widgetConfig = this.parseWidgetConfig(newValue);
      this.updateCheckoutConfig();
    } else {
      this[name] = newValue;
    }
    this.renderWidget();
  }

  updateCheckoutConfig() {
    const isProduction = this.widgetConfig!.environment === Environment.PRODUCTION;
    const isDevelopment = !isProduction && this.widgetConfig?.environment !== Environment.SANDBOX;
    this.checkoutConfig = { isDevelopment, isProduction } as CheckoutConfiguration;
  }

  connectedCallback() {
    const widgetConfig = this.getAttribute('widgetConfig') || undefined;
    this.widgetConfig = this.parseWidgetConfig(widgetConfig);
    this.updateCheckoutConfig();
  }

  private parseWidgetConfig(widgetsConfig?: string):StrongCheckoutWidgetsConfig {
    try {
      return withDefaultWidgetConfigs(
        JSON.parse(widgetsConfig || '{}'),
      );
    } catch (e) {
      return withDefaultWidgetConfigs();
    }
  }

  abstract renderWidget(): void;
}
