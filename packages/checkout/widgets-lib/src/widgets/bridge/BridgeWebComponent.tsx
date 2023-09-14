import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { BiomeCombinedProviders } from '@biom3/react';
import { onDarkBase } from '@biom3/design-tokens';
import { BridgeWidget, BridgeWidgetParams } from './BridgeWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { ConnectTargetLayer, getL1ChainId } from '../../lib';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';
import { isValidAddress, isValidAmount, isValidWalletProvider } from '../../lib/validations/widgetValidators';
import { isPassportProvider } from '../../lib/providerUtils';
import { BridgeComingSoon } from './views/BridgeComingSoon';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';

export class ImmutableBridge extends ImmutableWebComponent {
  fromContractAddress = '';

  amount = '';

  walletProvider: WalletProviderName | undefined = undefined;

  static get observedAttributes(): string[] {
    const baseObservedAttributes = super.observedAttributes;
    return [...baseObservedAttributes, 'amount', 'fromContractAddress'];
  }

  connectedCallback() {
    super.connectedCallback();
    this.fromContractAddress = this.getAttribute('fromContractAddress')?.toLowerCase() ?? '';
    this.amount = this.getAttribute('amount') ?? '';
    this.walletProvider = this.getAttribute(
      'walletProvider',
    )?.toLowerCase() as WalletProviderName;

    this.renderWidget();
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'amount') {
      this.amount = newValue;
    }
    if (name === 'fromcontractaddress') {
      this.fromContractAddress = newValue;
    }

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

    if (!isValidAddress(this.fromContractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "fromContractAddress" widget input');
      this.fromContractAddress = '';
    }
  }

  renderWidget() {
    this.validateInputs();

    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
      passport: this.passport,
      allowedChains: [
        getL1ChainId(this.checkout!.config),
      ],
    };
    const params: BridgeWidgetParams = {
      fromContractAddress: this.fromContractAddress,
      amount: this.amount,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }
    const showBridgeComingSoonScreen = isPassportProvider(this.provider)
    || this.walletProvider === WalletProviderName.PASSPORT;

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider
          widgetConfig={this.widgetConfig!}
        >
          {showBridgeComingSoonScreen && (
          <BiomeCombinedProviders theme={{ base: onDarkBase }}>
            <BridgeComingSoon onCloseEvent={() => sendBridgeWidgetCloseEvent(window)} />
          </BiomeCombinedProviders>
          )}
          {!showBridgeComingSoonScreen && (
          <ConnectLoader
            params={connectLoaderParams}
            closeEvent={() => sendBridgeWidgetCloseEvent(window)}
            widgetConfig={this.widgetConfig!}
          >
            <BridgeWidget
              params={params}
              config={this.widgetConfig!}
            />
          </ConnectLoader>
          )}
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}
