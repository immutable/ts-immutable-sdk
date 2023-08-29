import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { useEffect, useMemo, useReducer } from 'react';
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
import { AnalyticsProvider } from '../../context/SegmentAnalyticsProvider';

const LOADING_VIEW_DELAY_MS = 1000;
export interface OnRampWidgetProps {
  // eslint-disable-next-line react/no-unused-prop-types
  params: OnRampWidgetParams;
  config: StrongCheckoutWidgetsConfig;
}

export interface OnRampWidgetParams {
  amount?: string;
}

export function OnRampWidget(props: OnRampWidgetProps) {
  const { config } = props;
  const { environment, theme } = config;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewReducer]);

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const { initialLoadingText } = text.views[OnRampWidgetViews.ONRAMP];

  useEffect(() => {
    setTimeout(() => {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: OnRampWidgetViews.ONRAMP },
        },
      });
    }, LOADING_VIEW_DELAY_MS);
  }, [viewDispatch]);

  return (
    <AnalyticsProvider>
      <BiomeCombinedProviders theme={{ base: biomeTheme }}>
        <ViewContext.Provider value={viewReducerValues}>
          {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={initialLoadingText} showFooterLogo />
          )}
          {viewState.view.type === OnRampWidgetViews.ONRAMP && (
            <OnRampMain environment={environment} />
          )}
        </ViewContext.Provider>
      </BiomeCombinedProviders>
    </AnalyticsProvider>
  );
}
