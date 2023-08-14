import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { OnRampWidget, OnRampWidgetParams } from './OnRampWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { isValidAmount, isValidWalletProvider } from '../../lib/validations/widgetValidators';

export class ImmutableOnRamp extends ImmutableWebComponent {
  amount = '';

  walletProvider: WalletProviderName = WalletProviderName.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    console.log('in connectedCallback');

    this.amount = this.getAttribute('amount') ?? '';
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
  }

  renderWidget() {
    console.log('start render onramp widget');

    // this.validateInputs();

    // const connectLoaderParams: ConnectLoaderParams = {
    //   targetLayer: ConnectTargetLayer.LAYER2,
    //   walletProvider: this.walletProvider,
    //   web3Provider: this.provider,
    //   allowedChains: [
    //     getL2ChainId(this.checkout!.config),
    //   ],
    // };
    const params: OnRampWidgetParams = {
      amount: this.amount,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    console.log('render onramp widget');

    this.reactRoot.render(
      <React.StrictMode>
        <OnRampWidget
          params={params}
          config={this.widgetConfig!}
        />
      </React.StrictMode>,
    );
  }
}
