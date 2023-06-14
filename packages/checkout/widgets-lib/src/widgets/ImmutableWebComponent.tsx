import ReactDOM from 'react-dom/client';
import { Web3Provider } from '@ethersproject/providers';
import { StrongCheckoutWidgetsConfig, withDefaultWidgetConfigs } from '../lib/withDefaultWidgetConfig';

export abstract class ImmutableWebComponent extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  widgetConfig?: StrongCheckoutWidgetsConfig;

  injectedProvider?: boolean;

  provider: Web3Provider | undefined = undefined;

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
    } else {
      this[name] = newValue;
    }
    this.renderWidget();
  }

  connectedCallback() {
    const widgetConfig = this.getAttribute('widgetConfig') || undefined;
    this.widgetConfig = this.parseWidgetConfig(widgetConfig);
    this.injectedProvider = !!this.getAttribute('injectedProvider') || false;
  }

  connectedProviderCheck() {
    return new Promise((resolve):void => {
      if (!this.injectedProvider) {
        resolve(true);
        return;
      }
      let timer: number;
      let attempts = 0;
      const maxAttempts = 10;

      const attemptToSetProvider = () => {
        if (this.provider) {
          resolve(true);
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            window.clearInterval(timer);
            resolve(false);
          }
        }
      };

      timer = window.setInterval(attemptToSetProvider, 10);
      attemptToSetProvider();
    });
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
