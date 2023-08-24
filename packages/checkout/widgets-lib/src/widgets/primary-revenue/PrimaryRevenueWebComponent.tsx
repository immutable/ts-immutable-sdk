import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrimaryRevenueWidget } from './PrimaryRevenueWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, getL1ChainId, getL2ChainId } from '../../lib';
import {
  isValidAddress,
  isValidAmount,
} from '../../lib/validations/widgetValidators';

export class ImmutablePrimaryRevenue extends ImmutableWebComponent {
  amount = '';

  fromContractAddress = '';

  constructor() {
    console.log('ImmutablePrimaryRevenue constructor'); // eslint-disable-line no-console
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.amount = this.getAttribute('amount') ?? '';
    this.fromContractAddress = this.getAttribute('fromContractAddress')?.toLowerCase() ?? '';

    this.renderWidget();
  }

  validateInputs(): void {
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
      targetLayer: ConnectTargetLayer.LAYER2,
      web3Provider: this.provider,
      passport: this.passport,
      allowedChains: [
        getL1ChainId(this.checkout!.config),
        getL2ChainId(this.checkout!.config),
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
          closeEvent={() => {}}
        >
          <PrimaryRevenueWidget
            config={this.widgetConfig!}
            amount={this.amount}
            fromContractAddress={this.fromContractAddress}
          />
        </ConnectLoader>
      </React.StrictMode>,
    );
  }
}
