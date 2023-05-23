import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { Network } from '@imtbl/checkout-widgets';
import { BridgeWidget, BridgeWidgetParams } from './BridgeWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectLoader } from '../../components/ConnectLoader/ConnectLoader';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';

export class ImmutableBridge extends ImmutableWebComponent {
  fromNetwork = Network.ETHEREUM;

  fromContract = '';

  amount = '';

  providerPreference: ConnectionProviders = ConnectionProviders.METAMASK;

  useConnectWidget?: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.fromContract = this.getAttribute('fromContractAddress') as string;
    this.fromNetwork = this.getAttribute('fromNetwork') as Network;
    this.amount = this.getAttribute('amount') as string;
    this.providerPreference = this.getAttribute(
      'providerPreference',
    ) as ConnectionProviders;
    const useConnectWidgetProp = this.getAttribute('useConnectWidget');
    this.useConnectWidget = useConnectWidgetProp?.toLowerCase() !== 'false';
    this.renderWidget();
  }

  renderWidget() {
    const params: BridgeWidgetParams = {
      providerPreference: this.providerPreference,
      fromContractAddress: this.fromContract,
      fromNetwork: this.fromNetwork,
      amount: this.amount,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        {this.useConnectWidget ? (
          <ConnectLoader
            params={params}
            theme={this.theme}
            closeEvent={sendBridgeWidgetCloseEvent}
            environment={this.environment}
          >
            <BridgeWidget
              params={params}
              theme={this.theme}
              environment={this.environment}
            />
          </ConnectLoader>
        ) : (
          <BridgeWidget
            params={params}
            theme={this.theme}
            environment={this.environment}
          />
        )}
      </React.StrictMode>,
    );
  }
}
