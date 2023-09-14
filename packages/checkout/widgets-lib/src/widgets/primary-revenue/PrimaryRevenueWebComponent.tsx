import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrimaryRevenueWidget } from './PrimaryRevenueWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, getL1ChainId, getL2ChainId } from '../../lib';
import { isValidAmount } from '../../lib/validations/widgetValidators';
import { Item } from './hooks/useMergeItemsInfo';
import { sendPrimaryRevenueWidgetCloseEvent } from './PrimaryRevenuWidgetEvents';

export class ImmutablePrimaryRevenue extends ImmutableWebComponent {
  amount = '';

  envId = '';

  fromCurrency = '';

  items: Item[] = [];

  constructor() {
    console.log('ImmutablePrimaryRevenue constructor'); // eslint-disable-line no-console
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.amount = this.getAttribute('amount') ?? '';
    this.envId = this.getAttribute('envId') ?? '';
    this.fromCurrency = this.getAttribute('fromCurrency') ?? '';

    const items = this.getAttribute('items') ?? '';
    if (items) {
      try {
        this.items = JSON.parse(items);
      } catch (error) {
        console.error('Failed to parse items attribute:', error);
        this.items = [];
      }
    }

    this.renderWidget();
  }

  validateInputs(): void {
    if (!isValidAmount(this.amount)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "amount" widget input');
      this.amount = '';
    }

    if (this.items.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "items" widget input');
      this.items = [];
    }

    if (!this.envId) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "envId" widget input');
      this.envId = '';
    }

    if (!this.fromCurrency) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "fromCurrency" widget input');
      this.fromCurrency = '';
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
          closeEvent={() => {
            sendPrimaryRevenueWidgetCloseEvent();
          }}
        >
          <PrimaryRevenueWidget
            config={this.widgetConfig!}
            amount={this.amount}
            fromCurrency={this.fromCurrency}
            items={this.items}
          />
        </ConnectLoader>
      </React.StrictMode>,
    );
  }
}
