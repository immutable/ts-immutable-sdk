import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WalletWidget, WalletWidgetParams } from './WalletWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

export class ImmutableWallet extends ImmutableWebComponent {
  providerPreference = ConnectionProviders.METAMASK;

  useConnectWidget?: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.providerPreference = this.getAttribute(
      'providerPreference',
    ) as ConnectionProviders;

    const useConnectWidgetProp = this.getAttribute('useConnectWidget');
    this.useConnectWidget = useConnectWidgetProp?.toLowerCase() !== 'false';

    this.renderWidget();
  }

  renderWidget() {
    console.log('ImmutableWallet renderWidget');

    const connectLoaderParams: ConnectLoaderParams = {
      providerPreference: this.providerPreference,
    };

    const walletParams: WalletWidgetParams = {
      providerPreference: this.providerPreference,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        {this.useConnectWidget ? (
          <ConnectLoader
            environment={this.widgetConfig!.environment}
            theme={this.widgetConfig!.theme}
            params={connectLoaderParams}
            closeEvent={sendWalletWidgetCloseEvent}
          >
            <WalletWidget
              params={walletParams}
              widgetConfig={this.widgetConfig!}
            />
          </ConnectLoader>
        ) : (
          <WalletWidget
            params={walletParams}
            widgetConfig={this.widgetConfig!}
          />
        )}
      </React.StrictMode>,
    );
  }
}
