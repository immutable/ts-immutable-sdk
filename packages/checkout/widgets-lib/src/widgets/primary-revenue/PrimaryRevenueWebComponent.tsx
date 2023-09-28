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
import { sendPrimaryRevenueWidgetCloseEvent } from './PrimaryRevenueWidgetEvents';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { Item } from './types';

export class ImmutablePrimaryRevenue extends ImmutableWebComponent {
  /**
   * Amount to be paid
   */
  amount = '';

  /**
   * Environment ID: SANDBOX, PRODUCTION, DEV
   */
  env = '';

  /**
   * Immutable hub environment ID
   */
  environmentId = '';

  /**
   * Contract address of the token to be paid with
   */
  fromContractAddress = '';

  /**
   * Base64 encoded Item[]
   */
  products: string = '';

  private items: Item[] = [];

  constructor() {
    console.log('ImmutablePrimaryRevenue constructor'); // eslint-disable-line no-console
    super();
  }

  static get observedAttributes(): string[] {
    const baseObservedAttributes = super.observedAttributes;
    return [
      ...baseObservedAttributes,
      'amount',
      'products',
      'fromContractAddress',
      'env',
      'environmentId',
    ];
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name === 'amount') {
      this.amount = newValue;
    }

    if (name === 'fromContractAddress') {
      this.fromContractAddress = newValue;
    }

    if (name === 'env') {
      this.env = newValue;
    }

    if (name === 'environmentId') {
      this.environmentId = newValue;
    }

    if (name === 'products') {
      this.setItems(newValue);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.amount = this.getAttribute('amount') ?? '';
    this.env = this.getAttribute('env') ?? '';
    this.environmentId = this.getAttribute('environmentId') ?? '';
    this.fromContractAddress = this.getAttribute('fromContractAddress') ?? '';

    const products = this.getAttribute('products') ?? '';
    this.setItems(products);
  }

  private setItems(items: string) {
    if (items) {
      try {
        this.items = JSON.parse(atob(this.products));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse products attribute. It must be a base64 encoded Item[].', error);
        this.items = [];
      }
    }
  }

  private isValidProucts(): boolean {
    return Array.isArray(JSON.parse(atob(this.products)));
  }

  validateInputs(): void {
    if (!isValidAmount(this.amount)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "amount" widget input');
      this.amount = '';
    }

    if (this.isValidProucts()) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "products" widget input. It must be a base64 encoded Item[]');
      this.items = [];
    }

    if (!this.env) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "env" widget input');
      this.env = '';
    }

    if (!this.environmentId) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "environmentId" widget input');
      this.environmentId = '';
    }

    if (!this.fromContractAddress) {
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
        <CustomAnalyticsProvider widgetConfig={this.widgetConfig!}>
          <ConnectLoader
            widgetConfig={this.widgetConfig!}
            params={connectLoaderParams}
            closeEvent={() => {
              sendPrimaryRevenueWidgetCloseEvent(window);
            }}
          >
            <PrimaryRevenueWidget
              config={this.widgetConfig!}
              items={this.items}
              amount={this.amount}
              fromContractAddress={this.fromContractAddress}
              environmentId={this.environmentId}
              env={this.env}
            />
          </ConnectLoader>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}
