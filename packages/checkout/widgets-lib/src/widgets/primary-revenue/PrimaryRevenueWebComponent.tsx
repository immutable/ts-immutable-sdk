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
import { sendPrimaryRevenueWidgetCloseEvent } from './PrimaryRevenuWidgetEvents';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { Item } from './types';

export class ImmutablePrimaryRevenue extends ImmutableWebComponent {
  amount = '';

  envId = '';

  fromCurrency = '';

  items: Item[] = [];

  constructor() {
    console.log('ImmutablePrimaryRevenue constructor'); // eslint-disable-line no-console
    super();
  }

  static get observedAttributes(): string[] {
    const baseObservedAttributes = super.observedAttributes;
    return [
      ...baseObservedAttributes,
      'amount',
      'envId',
      'fromCurrency',
      'items',
    ];
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name === 'amount') {
      this.amount = newValue;
    }
    if (name === 'envId') {
      this.envId = newValue;
    }
    if (name === 'fromCurrency') {
      this.fromCurrency = newValue;
    }
    if (name === 'items') {
      this.setItems(newValue);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.amount = this.getAttribute('amount') ?? '';
    this.envId = this.getAttribute('envId') ?? '';
    this.fromCurrency = this.getAttribute('fromCurrency') ?? '';

    const items = this.getAttribute('items') ?? '';
    this.setItems(items);
  }

  private setItems(items: string) {
    if (items) {
      try {
        this.items = JSON.parse(items);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse items attribute:', error);
        this.items = [];
      }
    }
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
        <CustomAnalyticsProvider widgetConfig={this.widgetConfig!}>
          <ConnectLoader
            widgetConfig={this.widgetConfig!}
            params={connectLoaderParams}
            closeEvent={() => {
              sendPrimaryRevenueWidgetCloseEvent();
            }}
          >
            <PrimaryRevenueWidget
              config={this.widgetConfig!}
              envId={this.envId}
              items={this.items}
              amount={this.amount}
              fromCurrency={this.fromCurrency}
            />
          </ConnectLoader>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}
