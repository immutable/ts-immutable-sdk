import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WalletWidget, WalletWidgetParams } from './WalletWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer } from '../../lib';

export class ImmutableWallet extends ImmutableWebComponent {
  walletProvider?:WalletProviderName;

  connectedCallback() {
    super.connectedCallback();
    this.walletProvider = this.getAttribute('walletProvider') as WalletProviderName;
    this.renderWidget();
  }

  renderWidget() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      providerName: this.walletProvider,
      web3Provider: this.provider,
    };

    const walletParams: WalletWidgetParams = {
      providerName: this.walletProvider,
      web3Provider: this.provider,
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
            params={walletParams}
            config={this.widgetConfig!}
          />
        </ConnectLoader>
      </React.StrictMode>,
    );
  }
}
