import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { BiomeCombinedProviders, BiomePortalIdProvider } from '@biom3/react';
import { onDarkBase } from '@biom3/design-tokens';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
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
import { orchestrationEvents } from '../../lib/orchestrationEvents';

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
                      primaryActionText="Buy with card"
                      onPrimaryButtonClick={() => {
                        orchestrationEvents.sendRequestOnrampEvent(
                          window,
                          IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
                          {
                            tokenAddress: '',
                            amount: '',
                          },
                        );
                      }}
                      secondaryActionText="bridge"
                      onSecondaryButtonClick={() => {
                        orchestrationEvents.sendRequestBridgeEvent(
                          window,
                          IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
                          {
                            tokenAddress: '',
                            amount: '',
                          },
                        );
                      }}
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
