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
import { ConnectTargetLayer } from '../../lib';

export class ImmutableSwap extends ImmutableWebComponent {
  providerName = WalletProviderName.METAMASK;

  useConnectWidget?: boolean;

  amount = '';

  fromContractAddress = '';

  toContractAddress = '';

  connectedCallback() {
    super.connectedCallback();
    this.providerName = this.getAttribute(
      'providerName',
    ) as WalletProviderName;
    const useConnectWidgetProp = this.getAttribute('useConnectWidget');
    this.useConnectWidget = useConnectWidgetProp?.toLowerCase() !== 'false';
    this.amount = this.getAttribute('amount') as string;
    this.fromContractAddress = this.getAttribute(
      'fromContractAddress',
    ) as string;
    this.toContractAddress = this.getAttribute('toContractAddress') as string;
    this.renderWidget();
  }

  renderWidget() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      providerName: this.providerName,
    };

    const swapParams: SwapWidgetParams = {
      providerName: this.providerName,
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
            widgetConfig={this.widgetConfig!}
            params={connectLoaderParams}
            closeEvent={sendSwapWidgetCloseEvent}
          >
            <SwapWidget
              params={swapParams}
              config={this.widgetConfig!}
            />
          </ConnectLoader>
        ) : (
          <SwapWidget
            params={swapParams}
            config={this.widgetConfig!}
          />
        )}
      </React.StrictMode>,
    );
  }
}
