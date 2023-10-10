import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM, { createRoot } from 'react-dom/client';
import { BiomePortalIdProvider } from '@biom3/react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { WalletWidget } from './WalletWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, getL1ChainId, getL2ChainId } from '../../lib';
import { isValidWalletProvider } from '../../lib/validations/widgetValidators';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';

export class ImmutableWallet extends ImmutableWebComponent {
  walletProvider: WalletProviderName | undefined = undefined;

  static get observedAttributes(): string[] {
    const baseObservedAttributes = super.observedAttributes;
    return [...baseObservedAttributes, 'walletprovider'];
  }

  connectedCallback() {
    super.connectedCallback();
    this.walletProvider = this.getAttribute('walletProvider')?.toLowerCase() as WalletProviderName;
    this.renderWidget();
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name === 'walletprovider') {
      this.walletProvider = newValue.toLowerCase() as WalletProviderName;
    }

    this.renderWidget();
  }

  validateInputs(): void {
    if (!isValidWalletProvider(this.walletProvider)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProvider" widget input');
      this.walletProvider = undefined;
    }
  }

  renderWidget() {
    this.validateInputs();
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
      passport: this.passport,
      allowedChains: [
        getL1ChainId(this.checkout!.config),
        getL2ChainId(this.checkout!.config),
      ],
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    // create root container where react element will be inserted
    const container = document.createElement('div');

    // attach shadow DOM to container
    const shadowRoot = container.attachShadow({ mode: 'open' });

    // get hold of an existing element in HTML DOM
    const domElement = document.getElementById('name');

    // insert root container element in HTML DOM after the existing element
    domElement?.replaceChildren(container);

    // const container = document.querySelector('#root');
    const emotionRoot = document.createElement('style');
    const shadowRootElement = document.createElement('div');
    shadowRoot.appendChild(emotionRoot);
    shadowRoot.appendChild(shadowRootElement);

    const cache = createCache({
      key: 'css',
      prepend: true,
      container: emotionRoot,
    });

    // shadow DOM as react root
    const root = createRoot(shadowRoot);

    // render react element inside shadow DOM
    root.render(
      <React.StrictMode>
        <CacheProvider value={cache}>
          <BiomePortalIdProvider>
            <CustomAnalyticsProvider widgetConfig={this.widgetConfig!}>
              <ConnectLoader
                widgetConfig={this.widgetConfig!}
                params={connectLoaderParams}
                closeEvent={() => sendWalletWidgetCloseEvent(window)}
              >
                <WalletWidget
                  config={this.widgetConfig!}
                />
              </ConnectLoader>
            </CustomAnalyticsProvider>
          </BiomePortalIdProvider>
        </CacheProvider>
      </React.StrictMode>,
    );
  }
}
