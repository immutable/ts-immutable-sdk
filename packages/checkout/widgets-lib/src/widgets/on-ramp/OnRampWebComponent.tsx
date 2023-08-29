import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { OnRampWidget, OnRampWidgetParams } from './OnRampWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { isValidAddress, isValidAmount, isValidWalletProvider } from '../../lib/validations/widgetValidators';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { sendOnRampWidgetCloseEvent } from './OnRampWidgetEvents';
import { ConnectTargetLayer, getL2ChainId } from '../../lib';
import { AnalyticsProvider } from '../../context/segment-provider/SegmentAnalyticsProvider';

export class ImmutableOnRamp extends ImmutableWebComponent {
  amount = '';

  walletProvider?: WalletProviderName;

  contractAddress = '';

  connectedCallback() {
    super.connectedCallback();
    this.amount = this.getAttribute('amount') ?? '';
    this.walletProvider = this.getAttribute('walletProvider')?.toLowerCase() as WalletProviderName;
    this.contractAddress = this.getAttribute('contractAddress') ?? '';

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

    if (!isValidAddress(this.contractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "contractAddress" widget input');
      this.contractAddress = '';
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
        getL2ChainId(this.checkout!.config),
      ],
    };
    const params: OnRampWidgetParams = {
      amount: this.amount,
      contractAddress: this.contractAddress,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <AnalyticsProvider>
          <ConnectLoader
            params={connectLoaderParams}
            widgetConfig={this.widgetConfig!}
            closeEvent={sendOnRampWidgetCloseEvent}
          >
            <OnRampWidget
              params={params}
              config={this.widgetConfig!}
            />
          </ConnectLoader>
        </AnalyticsProvider>
      </React.StrictMode>,
    );
  }
}
