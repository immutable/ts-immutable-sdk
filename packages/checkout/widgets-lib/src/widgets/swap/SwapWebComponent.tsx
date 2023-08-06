import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { SwapWidget, SwapWidgetParams } from './SwapWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendSwapWidgetCloseEvent } from './SwapWidgetEvents';
import { ConnectTargetLayer, getL2ChainId } from '../../lib';
import { isValidAddress, isValidAmount, isValidWalletProvider } from '../../lib/validations/widgetValidators';

export class ImmutableSwap extends ImmutableWebComponent {
  walletProvider = WalletProviderName.METAMASK;

  amount = '';

  fromContractAddress = '';

  toContractAddress = '';

  connectedCallback() {
    super.connectedCallback();
    this.walletProvider = this.getAttribute(
      'walletProvider',
    )?.toLowerCase() as WalletProviderName ?? WalletProviderName.METAMASK;
    this.amount = this.getAttribute('amount') ?? '';
    this.fromContractAddress = this.getAttribute('fromContractAddress')?.toLowerCase() ?? '';
    this.toContractAddress = this.getAttribute('toContractAddress')?.toLowerCase() ?? '';
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

    if (!isValidAddress(this.toContractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toContractAddress" widget input');
      this.toContractAddress = '';
    }
  }

  renderWidget() {
    this.validateInputs();
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
      allowedChains: [
        getL2ChainId(this.checkout!.config),
      ],
    };

    const swapParams: SwapWidgetParams = {
      amount: this.amount,
      fromContractAddress: this.fromContractAddress,
      toContractAddress: this.toContractAddress,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <ConnectLoader
          params={connectLoaderParams}
          widgetConfig={this.widgetConfig!}
          closeEvent={sendSwapWidgetCloseEvent}
        >
          <SwapWidget
            params={swapParams}
            config={this.widgetConfig!}
          />
        </ConnectLoader>
      </React.StrictMode>,
    );
  }
}
