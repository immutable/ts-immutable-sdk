import {
  useCallback, useContext, useEffect, useMemo, useReducer, useRef,
} from 'react';

import { BlockExplorerService, ChainId, SaleWidgetParams } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { useTranslation } from 'react-i18next';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import {
  SharedViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
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

export interface SaleWidgetProps extends Required<Omit<SaleWidgetParams, 'walletProviderName'>> {
  config: StrongCheckoutWidgetsConfig;
}

export default function SaleWidget(props: SaleWidgetProps) {
  const { t } = useTranslation();
  const {
    config,
    amount,
    items,
    environmentId,
    fromTokenAddress,
    collectionName,
  } = props;
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const chainId = useRef<ChainId>();

  const { theme } = config;
  const biomeTheme = useMemo(() => widgetTheme(theme), [theme]);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const loadingText = viewState.view.data?.loadingText
    || t('views.LOADING_VIEW.text');

  useEffect(() => {
    if (!checkout || !provider) return;

    (async () => {
      const network = await checkout.getNetworkInfo({ provider });
      chainId.current = network.chainId;
    })();
  }, [checkout, provider]);

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
    <ViewContext.Provider value={viewReducerValues}>
      <SaleContextProvider
        value={{
          config,
          items,
          amount,
          fromTokenAddress,
          env: checkout!.config.environment ?? Environment.SANDBOX,
          environmentId,
          provider,
          checkout,
          passport: checkout?.passport,
          collectionName,
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
            <SaleErrorView
              biomeTheme={biomeTheme}
              errorType={viewState.view.data?.errorType}
              transactionHash={viewState.view.data?.transactionHash}
              blockExplorerLink={BlockExplorerService.getTransactionLink(
                chainId.current as ChainId,
                viewState.view.data?.transactionHash!,
              )}
            />
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
  );
}
