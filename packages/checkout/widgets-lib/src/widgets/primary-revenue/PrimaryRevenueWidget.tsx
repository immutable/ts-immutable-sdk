import {
  useCallback, useContext, useEffect, useMemo, useReducer,
} from 'react';

import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import { WidgetTheme } from '../../lib';
import { LoadingView } from '../../views/loading/LoadingView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { text } from '../../resources/text/textConfig';
import {
  viewReducer,
  initialViewState,
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../context/view-context/ViewContext';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';

import { PaymentMethods } from './views/PaymentMethods';
import { PrimaryRevenueWidgetViews } from '../../context/view-context/PrimaryRevenueViewContextTypes';

export interface PrimaryRevenueWidgetProps {
  config: StrongCheckoutWidgetsConfig;
}

export function PrimaryRevenueWidget(props: PrimaryRevenueWidgetProps) {
  const { config } = props;
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;

  const { theme } = config;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const mount = useCallback(async () => {
    if (!checkout || !provider) return;

    try {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: PrimaryRevenueWidgetViews.PAYMENT_METHODS },
        },
      });
    } catch (error: any) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error,
          },
        },
      });
    }
  }, [checkout, provider]);

  useEffect(() => {
    if (!checkout || !provider) return;
    mount();
  }, [checkout, provider]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        {viewState.view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={loadingText} />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAYMENT_METHODS && (
          <PaymentMethods />
        )}
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
