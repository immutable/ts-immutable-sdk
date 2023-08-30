import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { WidgetTheme } from '../../lib';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  SharedViews,
  ViewActions, ViewContext, initialViewState, viewReducer,
} from '../../context/view-context/ViewContext';
import { OnRampWidgetViews } from '../../context/view-context/OnRampViewContextTypes';
import { OnRampMain } from './views/OnRampMain';
import { LoadingView } from '../../views/loading/LoadingView';
import { text } from '../../resources/text/textConfig';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { TopUpView } from '../../views/top-up/TopUpView';
import { sendOnRampWidgetCloseEvent } from './OnRampWidgetEvents';
import { useAnalytics } from '../../context/segment-provider/SegmentAnalyticsProvider';

const LOADING_VIEW_DELAY_MS = 1000;
export interface OnRampWidgetProps {
  // eslint-disable-next-line react/no-unused-prop-types
  params: OnRampWidgetParams;
  config: StrongCheckoutWidgetsConfig;
}

export interface OnRampWidgetParams {
  amount?: string;
  contractAddress?: string;
}

export function OnRampWidget(props: OnRampWidgetProps) {
  const { config } = props;
  const {
    environment, theme, isOnRampEnabled, isSwapEnabled, isBridgeEnabled,
  } = config;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewReducer]);

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const { initialLoadingText } = text.views[OnRampWidgetViews.ONRAMP];
  const { track } = useAnalytics();

  useEffect(() => {
    track({
      userJourney: 'OnRamp',
      screen: 'Initial-widget-load',
      control: 'widgetLoad',
      controlType: 'OnRampWidget',
      action: 'Opened',
      userId: '0xsomeAddress', // todo: insert wallet-address
    });
  }, []);

  useEffect(() => {
    if (!checkout || !provider) return;
    (async () => {
      const network = await checkout.getNetworkInfo({
        provider,
      });

      /* If the provider's network is not supported, return out of this and let the
    connect loader handle the switch network functionality */
      if (!network.isSupported) {
        return;
      }
      setTimeout(() => {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: OnRampWidgetViews.ONRAMP },
          },
        });
      }, LOADING_VIEW_DELAY_MS);
    })();
  }, [checkout, provider, viewDispatch]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        {viewState.view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={initialLoadingText} showFooterLogo />
        )}
        {viewState.view.type === OnRampWidgetViews.ONRAMP && (
          <OnRampMain environment={environment} />
        )}
        {viewState.view.type === SharedViews.TOP_UP_VIEW && (
          <TopUpView
            widgetEvent={IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT}
            showOnrampOption={isOnRampEnabled}
            showSwapOption={isSwapEnabled}
            showBridgeOption={isBridgeEnabled}
            onCloseButtonClick={sendOnRampWidgetCloseEvent}
          />
        )}
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
