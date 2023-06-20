import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { BridgeWidget, BridgeWidgetParams } from './BridgeWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, Network } from '../../lib';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';

export class ImmutableBridge extends ImmutableWebComponent {
  fromNetwork = Network.ETHEREUM;

  fromContract = '';

  amount = '';

  walletProvider: WalletProviderName = WalletProviderName.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.fromContract = this.getAttribute('fromContractAddress') as string;
    this.fromNetwork = this.getAttribute('fromNetwork') as Network;
    this.amount = this.getAttribute('amount') as string;
    this.walletProvider = this.getAttribute(
      'walletProvider',
    ) as WalletProviderName;
    this.renderWidget();
  }

  renderWidget() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      providerName: this.walletProvider,
    };
    const params: BridgeWidgetParams = {
      fromContractAddress: this.fromContract,
      fromNetwork: this.fromNetwork,
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
