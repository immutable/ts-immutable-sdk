import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';

import { SmartWidget, SmartWidgetParams } from './SmartWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { getL1ChainId, getL2ChainId } from '../../lib';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { sendSmartWidgetCloseEvent } from './SmartWidgetEvents';
import { isValidAddress, isValidAmount, isValidWalletProvider } from '../../lib/validations/widgetValidators';

export class ImmutableSmart extends ImmutableWebComponent {
  fromContractAddress = '';

  amount = '';

  walletProvider: WalletProviderName | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();
    this.fromContractAddress = this.getAttribute('fromContractAddress')?.toLowerCase() ?? '';
    this.amount = this.getAttribute('amount') ?? '';
    this.walletProvider = this.getAttribute(
      'walletProvider',
    )?.toLowerCase() as WalletProviderName;

    console.log('this.walletProvider', this.walletProvider);

    this.renderWidget();
  }

  validateInputs(): void {
    if (!isValidWalletProvider(this.walletProvider)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProvider" widget input');
      this.walletProvider = undefined;
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
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
      passport: this.passport,
      allowedChains: [
        getL1ChainId(this.checkout!.config),
        getL2ChainId(this.checkout!.config),
      ],
    };
    const params: SmartWidgetParams = {
      fromContractAddress: this.fromContractAddress,
      amount: this.amount,
      connectLoaderParams,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>

        <ConnectLoader
          params={connectLoaderParams}
          closeEvent={sendSmartWidgetCloseEvent}
          widgetConfig={this.widgetConfig!}
        >
          <SmartWidget
            params={params}
            config={this.widgetConfig!}
          />
        </ConnectLoader>
      </React.StrictMode>,
    );
  }
}
