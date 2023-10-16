import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { BiomeCombinedProviders, BiomePortalIdProvider } from '@biom3/react';
import { onDarkBase } from '@biom3/design-tokens';
import { SwapWidget, SwapWidgetParams } from './SwapWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendSwapWidgetCloseEvent } from './SwapWidgetEvents';
import { ConnectTargetLayer, getL2ChainId } from '../../lib';
import {
  isValidAddress,
  isValidAmount,
  isValidWalletProvider,
} from '../../lib/validations/widgetValidators';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { ServiceUnavailableErrorView } from '../../views/error/ServiceUnavailableErrorView';
import { ServiceType } from '../../views/error/serviceTypes';
import { isPassportProvider } from '../../lib/providerUtils';
import { topUpBridgeOption, topUpOnRampOption } from './helpers';

export class ImmutableSwap extends ImmutableWebComponent {
  walletProvider: WalletProviderName | undefined = undefined;

  amount = '';

  fromContractAddress = '';

  toContractAddress = '';

  static get observedAttributes(): string[] {
    const baseObservedAttributes = super.observedAttributes;
    return [
      ...baseObservedAttributes,
      'amount',
      'fromcontractaddress',
      'tocontractaddress',
      'walletprovider',
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.walletProvider = this.getAttribute(
      'walletProvider',
    )?.toLowerCase() as WalletProviderName;
    this.amount = this.getAttribute('amount') ?? '';
    this.fromContractAddress = this.getAttribute('fromContractAddress')?.toLowerCase() ?? '';
    this.toContractAddress = this.getAttribute('toContractAddress')?.toLowerCase() ?? '';
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
    if (name === 'tocontractaddress') {
      this.toContractAddress = newValue;
    }
    if (name === 'walletprovider') {
      this.walletProvider = newValue.toLowerCase() as WalletProviderName;
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

    if (!isValidAddress(this.toContractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toContractAddress" widget input');
      this.toContractAddress = '';
    }
  }

  private isNotPassport = !isPassportProvider(this.provider)
    || this.walletProvider !== WalletProviderName.PASSPORT;

  private topUpOptions(): { text:string, action: ()=>void }[] | undefined {
    const optionsArray: { text:string, action: ()=>void }[] = [];

    const isOnramp = topUpOnRampOption(this.widgetConfig!.isOnRampEnabled);
    if (isOnramp) {
      optionsArray.push({ text: isOnramp.text, action: isOnramp.action });
    }
    const isBridge = topUpBridgeOption(this.widgetConfig!.isBridgeEnabled, this.isNotPassport);
    if (isBridge) {
      optionsArray.push({ text: isBridge.text, action: isBridge.action });
    }

    return optionsArray;
  }

  renderWidget() {
    this.validateInputs();
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProvider: this.walletProvider,
      web3Provider: this.provider,
      passport: this.passport,
      allowedChains: [getL2ChainId(this.checkout!.config)],
    };

    const swapParams: SwapWidgetParams = {
      amount: this.amount,
      fromContractAddress: this.fromContractAddress,
      toContractAddress: this.toContractAddress,
    };

    let isSwapAvailable = false;

    const topUpOptions = this.topUpOptions();

    this.checkout
      ?.isSwapAvailable()
      .then((available) => {
        isSwapAvailable = available;
      })
      .finally(() => {
        if (!this.reactRoot) {
          this.reactRoot = ReactDOM.createRoot(this);
        }

        this.reactRoot.render(
          <React.StrictMode>
            <BiomePortalIdProvider>
              <CustomAnalyticsProvider widgetConfig={this.widgetConfig!}>
                {!isSwapAvailable && (
                  <BiomeCombinedProviders theme={{ base: onDarkBase }}>
                    <ServiceUnavailableErrorView
                      service={ServiceType.SWAP}
                      onCloseClick={() => sendSwapWidgetCloseEvent(window)}
                      primaryActionText={topUpOptions && topUpOptions?.length > 0 ? topUpOptions[0].text : undefined}
                      onPrimaryButtonClick={
                      topUpOptions && topUpOptions?.length > 0
                        ? topUpOptions[0].action
                        : undefined
}
                      secondaryActionText={topUpOptions?.length === 2 ? topUpOptions[1].text : undefined}
                      onSecondaryButtonClick={topUpOptions?.length === 2 ? topUpOptions[1].action : undefined}
                    />
                  </BiomeCombinedProviders>
                )}
                {isSwapAvailable && (
                  <ConnectLoader
                    params={connectLoaderParams}
                    widgetConfig={this.widgetConfig!}
                    closeEvent={() => sendSwapWidgetCloseEvent(window)}
                  >
                    <SwapWidget
                      params={swapParams}
                      config={this.widgetConfig!}
                    />
                  </ConnectLoader>
                )}
              </CustomAnalyticsProvider>
            </BiomePortalIdProvider>
          </React.StrictMode>,
        );
      });
  }
}
