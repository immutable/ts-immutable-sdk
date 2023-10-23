import ReactDOM from 'react-dom/client';
import { Web3Provider } from '@ethersproject/providers';
import { sdkVersionCheck, sdkVersion } from '@imtbl/version-check';
import { Checkout } from '@imtbl/checkout-sdk';
import { Passport } from '@imtbl/passport';
import { StrongCheckoutWidgetsConfig, withDefaultWidgetConfigs } from '../lib/withDefaultWidgetConfig';

export abstract class ImmutableWebComponent extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  widgetConfig?: StrongCheckoutWidgetsConfig;

  provider: Web3Provider | undefined = undefined;

  checkout: Checkout | undefined;

  passport: Passport | undefined;

  static get observedAttributes() {
    return ['widgetconfig']; // attributes must be lowercase
  }

  setProvider(provider: Web3Provider): void {
    this.provider = provider;
    this.renderWidget();
  }

  addPassportOption(passport: Passport): void {
    this.passport = passport;
    this.renderWidget();
  }

  attributeChangedCallback(name: string, oldValue, newValue: any) {
    if (name === 'widgetconfig') {
      this.widgetConfig = this.parseWidgetConfig(newValue);
      this.updateCheckout();
    }
  }

  updateCheckout() {
    this.checkout = new Checkout({ baseConfig: { environment: this.widgetConfig!.environment } });
  }

  connectedCallback() {
    const widgetConfig = this.getAttribute('widgetconfig') || undefined;
    this.widgetConfig = this.parseWidgetConfig(widgetConfig);
    this.updateCheckout();
    // Leave version at the end so the widgets will load even if the next call fails
    sdkVersionCheck('checkout-widgets', sdkVersion);
  }

  private parseWidgetConfig(widgetsConfig?: string): StrongCheckoutWidgetsConfig {
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
