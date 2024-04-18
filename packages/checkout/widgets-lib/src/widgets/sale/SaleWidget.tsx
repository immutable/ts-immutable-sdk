import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import {
  BlockExplorerService,
  ChainId,
  IMTBLWidgetEvents,
  SaleWidgetParams,
} from '@imtbl/checkout-sdk';
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
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { TopUpView } from '../../views/top-up/TopUpView';
import { UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { sendSaleWidgetCloseEvent } from './SaleWidgetEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';

type OptionalWidgetParams = Pick<SaleWidgetParams, 'excludePaymentTypes'>;
type RequiredWidgetParams = Required<
Omit<SaleWidgetParams, 'walletProviderName'>
>;

type WidgetParams = RequiredWidgetParams & OptionalWidgetParams;
export interface SaleWidgetProps extends WidgetParams {
  config: StrongCheckoutWidgetsConfig;
}

export default function SaleWidget(props: SaleWidgetProps) {
  const { t } = useTranslation();
  const {
    config,
    amount,
    items,
    environmentId,
    collectionName,
    excludePaymentTypes,
  } = props;
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const chainId = useRef<ChainId>();

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const { theme } = config;
  const biomeTheme = useMemo(() => widgetTheme(theme), [theme]);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const loadingText = viewState.view.data?.loadingText || t('views.LOADING_VIEW.text');

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
          view: { type: SaleWidgetViews.PAYMENT_METHODS },
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
          environment: config.environment,
          environmentId,
          provider,
          checkout,
          passport: checkout?.passport,
          collectionName,
          excludePaymentTypes,
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
          {viewState.view.type === SaleWidgetViews.FUND_WITH_SMART_CHECKOUT && (
            <FundWithSmartCheckout subView={viewState.view.subView} />
          )}
          {viewState.view.type === SharedViews.TOP_UP_VIEW && (
            <TopUpView
              analytics={{ userJourney: UserJourney.SALE }}
              widgetEvent={IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT}
              checkout={checkout}
              provider={provider}
              showOnrampOption={config.isOnRampEnabled}
              showSwapOption={config.isSwapEnabled}
              showBridgeOption={config.isBridgeEnabled}
              onCloseButtonClick={() => sendSaleWidgetCloseEvent(eventTarget)}
              onBackButtonClick={() => {
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: SaleWidgetViews.PAYMENT_METHODS },
                  },
                });
              }}
              amount={viewState.view.data?.amount}
              tokenAddress={viewState.view.data?.tokenAddress}
              heading={viewState.view.data?.heading}
              subheading={viewState.view.data?.subheading}
            />
          )}
        </CryptoFiatProvider>
      </SaleContextProvider>
    </ViewContext.Provider>
  );
}
