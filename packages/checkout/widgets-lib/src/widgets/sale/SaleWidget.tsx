import {
  useCallback, useContext, useEffect, useMemo, useReducer, useRef,
} from 'react';

import { BiomeCombinedProviders } from '@biom3/react';

import { Item } from '@imtbl/checkout-sdk';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import {
  SharedViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { text } from '../../resources/text/textConfig';
import { LoadingView } from '../../views/loading/LoadingView';

import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { SaleWidgetViews } from '../../context/view-context/SaleViewContextTypes';
import { widgetTheme } from '../../lib/theme';
import { sendSaleWidgetCloseEvent } from './SaleWidgetEvents';
import { SaleContextProvider } from './context/SaleContextProvider';
import { FundWithSmartCheckout } from './views/FundWithSmartCheckout';
import { PayWithCard } from './views/PayWithCard';
import { PayWithCoins } from './views/PayWithCoins';
import { PaymentMethods } from './views/PaymentMethods';
import { SaleErrorView } from './views/SaleErrorView';

export interface SaleWidgetProps {
  config: StrongCheckoutWidgetsConfig;
  amount: string;
  items: Item[];
  fromContractAddress: string;
  env: string;
  environmentId: string;
  // connectLoaderParams?: ConnectLoaderParams; // Do we need this at all if it's not used, it should give provider and checkout from context
}

export function SaleWidget(props: SaleWidgetProps) {
  const {
    config,
    amount,
    items,
    fromContractAddress,
    env,
    environmentId,
  } = props;

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  console.log('INSIDE SALE WIDGET. provider and checkout ', provider, checkout);

  const { theme } = config;
  const biomeTheme = useMemo(() => widgetTheme(theme), [theme]);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const loadingText = viewState.view.data?.loadingText
    || text.views[SharedViews.LOADING_VIEW].text;

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const mounted = useRef(false);
  const onMount = useCallback(() => {
    if (!checkout || !provider) return;

    if (!mounted.current) {
      mounted.current = true;
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAYMENT_METHODS,
          },
        },
      });
    }
  }, [checkout, provider]);

  useEffect(() => {
    if (!checkout || !provider) return;

    onMount();
  }, [checkout, provider]);

  const closeWidget = () => {
    sendSaleWidgetCloseEvent(eventTarget);
  };

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <SaleContextProvider
          value={{
            config,
            items,
            amount,
            fromContractAddress,
            env,
            environmentId,
            provider,
            checkout,
            passport: checkout?.passport,
          }}
        >
          {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} />
          )}
          {viewState.view.type
            === SaleWidgetViews.PAYMENT_METHODS && <PaymentMethods />}
          {viewState.view.type === SaleWidgetViews.PAY_WITH_CARD && (
            <PayWithCard />
          )}
          {viewState.view.type === SaleWidgetViews.PAY_WITH_COINS && (
            <PayWithCoins />
          )}
          {viewState.view.type === SaleWidgetViews.SALE_FAIL && (
            <SaleErrorView biomeTheme={biomeTheme} errorType={viewState.view.data?.errorType} />
          )}
          {viewState.view.type === SaleWidgetViews.SALE_SUCCESS
            && provider && (
              <StatusView
                statusText={
                  text.views[SaleWidgetViews.SALE_SUCCESS].text
                }
                actionText={
                  text.views[SaleWidgetViews.SALE_SUCCESS].actionText
                }
                onActionClick={() => closeWidget()}
                statusType={StatusType.SUCCESS}
                testId="success-view"
              />
          )}
          {viewState.view.type === SaleWidgetViews.FUND_WITH_SMART_CHECKOUT && (
            <FundWithSmartCheckout subView={viewState.view.subView} />
          )}
        </SaleContextProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
