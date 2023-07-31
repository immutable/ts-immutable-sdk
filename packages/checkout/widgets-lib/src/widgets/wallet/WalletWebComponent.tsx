import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WalletWidget } from './WalletWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, getL1ChainId, getL2ChainId } from '../../lib';
import { isValidWalletProvider } from '../../lib/validations/widgetValidators';

export class ImmutableWallet extends ImmutableWebComponent {
  walletProvider = WalletProviderName.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.walletProvider = this.getAttribute('walletProvider')?.toLowerCase() as WalletProviderName;
    this.renderWidget();
  }

  validateInputs(): void {
    if (!isValidWalletProvider(this.walletProvider)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProvider" widget input');
      this.walletProvider = WalletProviderName.METAMASK;
    }
  }

  renderWidget() {
    this.validateInputs();
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
      allowedChains: [
        getL1ChainId(this.checkoutConfig!),
        getL2ChainId(this.checkoutConfig!),
      ],
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }
    this.reactRoot.render(
      <React.StrictMode>
        <ConnectLoader
          widgetConfig={this.widgetConfig!}
          params={connectLoaderParams}
          closeEvent={sendWalletWidgetCloseEvent}
        >
          <WalletWidget
            web3Provider={this.provider}
            config={this.widgetConfig!}
          />
        </ConnectLoader>
      </React.StrictMode>,
    );
  }
}
