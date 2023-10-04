/* eslint-disable no-console */
import {
  useCallback, useContext, useEffect, useMemo, useReducer,
} from 'react';

import { BiomeCombinedProviders } from '@biom3/react';

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

import { PrimaryRevenueWidgetViews } from '../../context/view-context/PrimaryRevenueViewContextTypes';
import { Item } from './types';
import { widgetTheme } from '../../lib/theme';
import { SharedContextProvider } from './context/SharedContextProvider';

export interface PrimaryRevenueWidgetProps {
  config: StrongCheckoutWidgetsConfig;
  amount: string;
  items: Item[];
  fromContractAddress: string;
  env: string;
  environmentId: string;
}

export function PrimaryRevenueWidget(props: PrimaryRevenueWidgetProps) {
  const {
    config, amount, items, fromContractAddress, env, environmentId,
  } = props;

  console.log(
    '@@@ PrimaryRevenueWidget',
    config,
    amount,
    items,
    fromContractAddress,
    env,
    environmentId,
  );

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const loadingText = text.views[SharedViews.LOADING_VIEW].text;

  const { theme } = config;
  const biomeTheme = useMemo(() => widgetTheme(theme), [theme]);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const onMount = useCallback(() => {
    if (!checkout || !provider) return;

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: PrimaryRevenueWidgetViews.PAYMENT_METHODS,
        },
      },
    });
  }, [checkout, provider]);

  useEffect(() => {
    if (!checkout || !provider) return;

    onMount();
  }, [checkout, provider]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <SharedContextProvider
          value={{
            items,
            amount,
            fromContractAddress,
            env,
            environmentId,
            provider,
            checkout,
          }}
        >
          {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} />
          )}
          {viewState.view.type === SharedViews.ERROR_VIEW && (
            <div>{viewState.view.error.message}</div>
          )}
          {viewState.view.type
            === PrimaryRevenueWidgetViews.PAYMENT_METHODS && (
            <div>Payment methods</div>
          )}
        </SharedContextProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
