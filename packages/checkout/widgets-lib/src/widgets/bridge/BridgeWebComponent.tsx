import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { BridgeWidget, BridgeWidgetParams } from './BridgeWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, getL1ChainId } from '../../lib';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';
import { isValidAddress, isValidAmount, isValidWalletProvider } from '../../lib/validations/widgetValidators';

export class ImmutableBridge extends ImmutableWebComponent {
  fromContractAddress = '';

  amount = '';

  walletProvider: WalletProviderName = WalletProviderName.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.fromContractAddress = this.getAttribute('fromContractAddress')?.toLowerCase() as string ?? '';
    this.amount = this.getAttribute('amount') as string ?? '';
    this.walletProvider = this.getAttribute(
      'walletProvider',
    )?.toLowerCase() as WalletProviderName ?? WalletProviderName.METAMASK;

    this.renderWidget();
  }

  validateInputs(): void {
    if (!isValidWalletProvider(this.walletProvider)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProvider" widget input');
      this.walletProvider = WalletProviderName.METAMASK;
    }

    if (!isValidAmount(this.amount)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "amount" widget input');
      this.amount = '';
    }

    if (!isValidAddress(this.fromContractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "fromContractAddress" widget input');
      this.fromContractAddress = '';
    }
  }

  renderWidget() {
    this.validateInputs();

    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
      allowedChains: [
        getL1ChainId(this.checkoutConfig!),
      ],
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
