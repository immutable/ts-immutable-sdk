import {
  useCallback, useContext, useEffect, useMemo, useReducer, useRef,
} from 'react';

import { BiomeCombinedProviders } from '@biom3/react';

import { SaleItem } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
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
import { SaleWidgetViews } from '../../context/view-context/SaleViewContextTypes';
import { widgetTheme } from '../../lib/theme';
import { SaleContextProvider } from './context/SaleContextProvider';
import { FundWithSmartCheckout } from './views/FundWithSmartCheckout';
import { PayWithCard } from './views/PayWithCard';
import { PayWithCoins } from './views/PayWithCoins';
import { PaymentMethods } from './views/PaymentMethods';
import { SaleErrorView } from './views/SaleErrorView';
import { SaleSuccessView } from './views/SaleSuccessView';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';

export interface SaleWidgetProps {
  config: StrongCheckoutWidgetsConfig;
  amount: string;
  items: SaleItem[];
  fromContractAddress: string;
  environmentId: string;
}

export default function SaleWidget(props: SaleWidgetProps) {
  const {
    config,
    amount,
    items,
    fromContractAddress,
    environmentId,
  } = props;

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const { theme } = config;
  const biomeTheme = useMemo(() => widgetTheme(theme), [theme]);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const loadingText = viewState.view.data?.loadingText
    || text.views[SharedViews.LOADING_VIEW].text;

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

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <SaleContextProvider
          value={{
            config,
            items,
            amount,
            fromContractAddress,
            env: checkout!.config.environment ?? Environment.SANDBOX,
            environmentId,
            provider,
            checkout,
            passport: checkout?.passport,
          }}
        >
          <CryptoFiatProvider environment={config.environment}>

            {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} />
            )}
            {viewState.view.type === SaleWidgetViews.PAYMENT_METHODS && (
            <PaymentMethods />
            )}
            {viewState.view.type === SaleWidgetViews.PAY_WITH_CARD && (
            <PayWithCard />
            )}
            {viewState.view.type === SaleWidgetViews.PAY_WITH_COINS && (
            <PayWithCoins />
            )}
            {viewState.view.type === SaleWidgetViews.SALE_FAIL && (
            <SaleErrorView biomeTheme={biomeTheme} errorType={viewState.view.data?.errorType} />
            )}
            {viewState.view.type === SaleWidgetViews.SALE_SUCCESS && provider && (
            <SaleSuccessView data={viewState.view.data} />
            )}
            {viewState.view.type === SaleWidgetViews.FUND_WITH_SMART_CHECKOUT && (
            <FundWithSmartCheckout subView={viewState.view.subView} />
            )}
          </CryptoFiatProvider>

        </SaleContextProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
