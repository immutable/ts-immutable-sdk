import React, { Suspense } from 'react';
import {
  ChainId,
  ConnectWidgetParams, IMTBLWidgetEvents, WidgetProperties, WidgetType,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { getChainNameById } from '../../lib/chains';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import i18n from '../../i18n';
import { Base } from '../BaseWidgetRoot';

const ConnectWidget = React.lazy(() => import('./ConnectWidget'));

export class Connect extends Base<WidgetType.CONNECT> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.CONNECT>,
  ): WidgetProperties<WidgetType.CONNECT> {
    return {
      config,
    };
  }

  protected getValidatedParameters(params: ConnectWidgetParams): ConnectWidgetParams {
    const validatedParams = params;

    // validating targetChainId per environment
    if (!params.targetChainId
      && this.checkout.config.isProduction) {
      validatedParams.targetChainId = ChainId.IMTBL_ZKEVM_MAINNET;
    } else if (params.targetChainId
      && this.checkout.config.isProduction
      && (params.targetChainId !== ChainId.ETHEREUM && params.targetChainId !== ChainId.IMTBL_ZKEVM_MAINNET)
    ) {
      // eslint-disable-next-line max-len, no-console
      console.warn(`Cannot set targetChainId to ${params.targetChainId} in ${Environment.PRODUCTION} environment, defaulting to ${getChainNameById(ChainId.IMTBL_ZKEVM_MAINNET)}, chainId ${ChainId.IMTBL_ZKEVM_MAINNET}`);
      validatedParams.targetChainId = ChainId.IMTBL_ZKEVM_MAINNET;
    }

    if (!params.targetChainId
      && this.checkout.config.environment === Environment.SANDBOX) {
      validatedParams.targetChainId = ChainId.IMTBL_ZKEVM_TESTNET;
    } else if (params.targetChainId
      && this.checkout.config.environment === Environment.SANDBOX
      && (params.targetChainId !== ChainId.SEPOLIA && params.targetChainId !== ChainId.IMTBL_ZKEVM_TESTNET)
    ) {
      // eslint-disable-next-line max-len, no-console
      console.warn(`Cannot set targetChainId to ${params.targetChainId} in ${Environment.SANDBOX} environment, defaulting to ${getChainNameById(ChainId.IMTBL_ZKEVM_TESTNET)}, chainId ${ChainId.IMTBL_ZKEVM_TESTNET}`);
      validatedParams.targetChainId = ChainId.IMTBL_ZKEVM_TESTNET;
    }

    return params;
  }

  protected render() {
    if (!this.reactRoot) return;
    const { t } = i18n;

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="connect-container" config={this.strongConfig()}>
            <HandoverProvider>
              <Suspense fallback={<LoadingView loadingText={t('views.LOADING_VIEW.text')} />}>
                <ConnectWidget
                  config={this.strongConfig()}
                  checkout={this.checkout}
                  targetWalletRdns={this.parameters.targetWalletRdns}
                  targetChainId={this.parameters.targetChainId}
                  blocklistWalletRdns={this.parameters.blocklistWalletRdns}
                />
              </Suspense>
            </HandoverProvider>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}
