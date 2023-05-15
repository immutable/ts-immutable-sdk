import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { Environment } from '@imtbl/config';
import { SwapWidget, SwapWidgetParams } from './SwapWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { Environment } from '@imtbl/config';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendSwapWidgetCloseEvent } from './SwapWidgetEvents';

export class ImmutableSwap extends ImmutableWebComponent {
  environment = Environment.SANDBOX;

  providerPreference = ConnectionProviders.METAMASK;
  useConnectWidget?: boolean;
  amount = '';

  fromContractAddress = '';

  toContractAddress = '';

  connectedCallback() {
    super.connectedCallback();
    this.providerPreference = this.getAttribute(
      'providerPreference',
    ) as ConnectionProviders;
    const useConnectWidgetProp = this.getAttribute('useConnectWidget');
    this.useConnectWidget =
      useConnectWidgetProp?.toLowerCase() === 'false' ? false : true;
    this.amount = this.getAttribute('amount') as string;
    this.fromContractAddress = this.getAttribute(
      'fromContractAddress',
    ) as string;
    this.toContractAddress = this.getAttribute('toContractAddress') as string;
    this.renderWidget();
  }

  renderWidget() {
    const connectLoaderParams: ConnectLoaderParams = {
      providerPreference: this.providerPreference,
    };

    const swapParams: SwapWidgetParams = {
      providerPreference: this.providerPreference,
      amount: this.amount,
      fromContractAddress: this.fromContractAddress,
      toContractAddress: this.toContractAddress,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        {this.useConnectWidget ? (
          <ConnectLoader
            environment={this.environment}
            theme={this.theme}
            params={connectLoaderParams}
            closeEvent={sendSwapWidgetCloseEvent}
          >
            <SwapWidget
              params={swapParams}
              theme={this.theme}
              environment={this.environment}
            />
          </ConnectLoader>
        ) : (
          <SwapWidget
            params={swapParams}
            theme={this.theme}
            environment={this.environment}
          />
        )}
      </React.StrictMode>
    );
  }
}
