import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { BridgeWidget, BridgeWidgetParams } from './BridgeWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer } from '../../lib';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';

export class ImmutableBridge extends ImmutableWebComponent {
  fromContractAddress = '';

  amount = '';

  walletProvider: WalletProviderName = WalletProviderName.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.fromContractAddress = this.getAttribute('fromContractAddress') as string;
    this.amount = this.getAttribute('amount') as string;
    this.walletProvider = this.getAttribute(
      'walletProvider',
    ) as WalletProviderName;
    this.renderWidget();
  }

  renderWidget() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
    };
    const params: BridgeWidgetParams = {
      fromContractAddress: this.fromContractAddress,
      amount: this.amount,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <ConnectLoader
          params={connectLoaderParams}
          closeEvent={sendBridgeWidgetCloseEvent}
          widgetConfig={this.widgetConfig!}
        >
          <BridgeWidget
            params={params}
            config={this.widgetConfig!}
          />
        </ConnectLoader>
      </React.StrictMode>,
    );
  }
}
