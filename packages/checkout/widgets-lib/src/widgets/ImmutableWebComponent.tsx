import ReactDOM from 'react-dom/client';
import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk';
import { StrongCheckoutWidgetsConfig, withDefaultWidgetConfigs } from '../lib/withDefaultWidgetConfig';

export abstract class ImmutableWebComponent extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  widgetConfig?: StrongCheckoutWidgetsConfig;

  provider: Web3Provider | undefined = undefined;

  checkout: Checkout | undefined;

  static get observedAttributes() {
    return ['widgetConfig'];
  }

  setProvider(provider: Web3Provider): void {
    this.provider = provider;
    this.renderWidget();
  }

  attributeChangedCallback(name: string, oldValue, newValue: any) {
    if (name === 'widgetConfig') {
      this.widgetConfig = this.parseWidgetConfig(newValue);
      this.updateCheckout();
    } else {
      this[name] = (newValue as string)?.toLowerCase();
    }
    this.renderWidget();
  }

  updateCheckout() {
    this.checkout = new Checkout({ baseConfig: { environment: this.widgetConfig!.environment } });
  }

  connectedCallback() {
    const widgetConfig = this.getAttribute('widgetConfig') || undefined;
    this.widgetConfig = this.parseWidgetConfig(widgetConfig);
    this.updateCheckout();
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
  abstract validateInputs(): void;
}
