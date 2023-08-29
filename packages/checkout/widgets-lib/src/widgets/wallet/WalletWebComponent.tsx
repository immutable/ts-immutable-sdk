import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WalletWidget } from './WalletWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, getL1ChainId, getL2ChainId } from '../../lib';
import { isValidWalletProvider } from '../../lib/validations/widgetValidators';
import { AnalyticsProvider } from '../../context/segment-provider/SegmentAnalyticsProvider';

export class ImmutableWallet extends ImmutableWebComponent {
  walletProvider: WalletProviderName | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();
    this.walletProvider = this.getAttribute('walletProvider')?.toLowerCase() as WalletProviderName;
    this.renderWidget();
  }

  validateInputs(): void {
    if (!isValidWalletProvider(this.walletProvider)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProvider" widget input');
      this.walletProvider = undefined;
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
        getL1ChainId(this.checkout!.config),
        getL2ChainId(this.checkout!.config),
      ],
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }
    this.reactRoot.render(
      <React.StrictMode>
        <AnalyticsProvider>
          <ConnectLoader
            widgetConfig={this.widgetConfig!}
            params={connectLoaderParams}
            closeEvent={sendWalletWidgetCloseEvent}
          >
            <WalletWidget
              config={this.widgetConfig!}
            />
          </ConnectLoader>
        </AnalyticsProvider>
      </React.StrictMode>,
    );
  }
}
