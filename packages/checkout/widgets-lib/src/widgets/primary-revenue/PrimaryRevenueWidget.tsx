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
import { PaymentMethods } from './views/PaymentMethods';
import { PayWithCard } from './views/PayWithCard';
import { PayWithCoins } from './views/PayWithCoins';
import { StatusView } from '../../components/Status/StatusView';
import { StatusType } from '../../components/Status/StatusType';

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
            config,
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
            === PrimaryRevenueWidgetViews.PAYMENT_METHODS && <PaymentMethods />}
          {viewState.view.type === PrimaryRevenueWidgetViews.PAY_WITH_CARD && (
            <PayWithCard />
          )}
          {viewState.view.type === PrimaryRevenueWidgetViews.PAY_WITH_COINS && (
            <PayWithCoins />
          )}
          {viewState.view.type === PrimaryRevenueWidgetViews.MINT_SUCCESS
            && provider && (
              <StatusView
                statusText={
                  text.views[PrimaryRevenueWidgetViews.MINT_SUCCESS].text
                }
                actionText={
                  text.views[PrimaryRevenueWidgetViews.MINT_SUCCESS].actionText
                }
                onActionClick={
                  /* TODO: use closeWidget function from error views PR */ () => {}
                }
                statusType={StatusType.SUCCESS}
                testId="success-view"
              />
          )}
        </SharedContextProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
