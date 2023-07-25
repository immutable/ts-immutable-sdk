import React from 'react';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WalletWidget } from './WalletWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, getL1ChainId, getL2ChainId } from '../../lib';

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
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
      allowedChains: [
        getL1ChainId(new Checkout({ baseConfig: { environment: this.widgetConfig!.environment } }).config),
        getL2ChainId(new Checkout({ baseConfig: { environment: this.widgetConfig!.environment } }).config),
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
