import React from 'react';
import {
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  OnRampWidgetParams,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL1ChainId, getL2ChainId } from 'lib';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { isValidAddress, isValidAmount } from 'lib/validations/widgetValidators';
import { BiomePortalIdProvider } from '@biom3/react';
import { OnRampWidget } from './OnRampWidget';
import { sendOnRampWidgetCloseEvent } from './OnRampWidgetEvents';

export class OnRamp extends Base<WidgetType.ONRAMP> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT;

  protected getValidatedProperties(
    { params, config }: WidgetProperties<WidgetType.ONRAMP>,
  ): WidgetProperties<WidgetType.ONRAMP> {
    let validatedParams: OnRampWidgetParams | undefined;
    let validatedConfig: WidgetConfiguration | undefined;

    if (params) {
      validatedParams = params;

      if (!isValidAmount(params.amount)) {
      // eslint-disable-next-line no-console
        console.warn('[IMTBL]: invalid "amount" widget input');
        validatedParams.amount = '';
      }

      if (!isValidAddress(params.contractAddress)) {
      // eslint-disable-next-line no-console
        console.warn('[IMTBL]: invalid "contractAddress" widget input');
        validatedParams.contractAddress = '';
      }
    }

    if (config) {
      validatedConfig = config;
      if (config.theme === WidgetTheme.LIGHT) validatedConfig.theme = WidgetTheme.LIGHT;
      else validatedConfig.theme = WidgetTheme.DARK;
    }

    return {
      params: validatedParams,
      config: validatedConfig,
    };
  }

  protected render() {
    const { params } = this.properties;

    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProvider: params?.walletProvider,
      web3Provider: params?.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config), getL2ChainId(this.checkout.config)],
    };

    if (!this.reactRoot) return;

    this.reactRoot.render(
      <React.StrictMode>
        <BiomePortalIdProvider>
          <CustomAnalyticsProvider widgetConfig={this.strongConfig()}>
            <ConnectLoader
              widgetConfig={this.strongConfig()}
              params={connectLoaderParams}
              closeEvent={() => sendOnRampWidgetCloseEvent(window)}
            >
              <OnRampWidget
                contractAddress={params?.contractAddress}
                amount={params?.amount}
                passport={params?.passport}
                config={this.strongConfig()}
              />
            </ConnectLoader>
          </CustomAnalyticsProvider>
        </BiomePortalIdProvider>
      </React.StrictMode>,
    );
  }
}
