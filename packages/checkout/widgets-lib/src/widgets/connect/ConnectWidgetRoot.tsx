import React, { Suspense } from 'react';
import {
  ConnectWidgetParams, IMTBLWidgetEvents, WidgetProperties, WidgetType,
} from '@imtbl/checkout-sdk';
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

    const { l1ChainId, l2ChainId, environment } = this.checkout.config;

    // validating targetChainId per environment
    if (!params.targetChainId) {
      validatedParams.targetChainId = l2ChainId;
    } else if (![l1ChainId, l2ChainId].includes(params.targetChainId)) {
      // eslint-disable-next-line max-len, no-console
      console.warn(`Cannot set targetChainId to ${params.targetChainId} in ${environment} environment, defaulting to ${getChainNameById(l2ChainId)}, chainId ${l2ChainId}`);
      validatedParams.targetChainId = l2ChainId;
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
