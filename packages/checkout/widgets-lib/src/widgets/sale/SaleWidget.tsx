import {
  useCallback, useContext, useEffect, useMemo, useReducer,
} from 'react';

import { BiomeCombinedProviders } from '@biom3/react';

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

import { ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView, StatusViewProps } from '../../components/Status/StatusView';
import { SaleWidgetViews } from '../../context/view-context/SaleViewContextTypes';
import { Item, SaleErrorTypes, PaymentTypes } from './types';
import { widgetTheme } from '../../lib/theme';
import { SaleContextProvider } from './context/SaleContextProvider';
import { FundWithSmartCheckout } from './views/FundWithSmartCheckout';
import { PayWithCard } from './views/PayWithCard';
import { PayWithCoins } from './views/PayWithCoins';
import { PaymentMethods } from './views/PaymentMethods';
import { useSaleEvent } from './hooks/useSaleEvents';

interface ErrorHandlerConfig {
  onActionClick?: () => void;
  onSecondaryActionClick?: () => void;
  statusType: StatusType;
  statusIconStyles?: Record<string, string>;
}

interface ErrorTextConfig {
  description: string;
  primaryAction?: string;
  secondaryAction?: string;
}

type AllErrorTextConfigs = Record<SaleErrorTypes, ErrorTextConfig>;

export interface SaleWidgetProps {
  config: StrongCheckoutWidgetsConfig;
  amount: string;
  items: Item[];
  fromContractAddress: string;
  env: string;
  environmentId: string;
  connectLoaderParams?: ConnectLoaderParams;
}

export function SaleWidget(props: SaleWidgetProps) {
  const {
    config,
    amount,
    items,
    fromContractAddress,
    env,
    environmentId,
    connectLoaderParams,
  } = props;

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { sendCloseEvent, sendSuccessEvent, sendFailedEvent } = useSaleEvent();

  const { theme } = config;
  const biomeTheme = useMemo(() => widgetTheme(theme), [theme]);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const loadingText = viewState.view.data?.loadingText
    || text.views[SharedViews.LOADING_VIEW].text;

  const onMount = useCallback(() => {
    if (!checkout || !provider) return;

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.PAYMENT_METHODS,
        },
      },
    });
  }, [checkout, provider]);

  useEffect(() => {
    if (!checkout || !provider) return;

    onMount();
  }, [checkout, provider]);

  const goBackToPaymentMethods = (type?: PaymentTypes | undefined) => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.PAYMENT_METHODS,
          data: { paymentMethod: type },
        },
      },
    });
  };

  const errorHandlersConfig: Record<SaleErrorTypes, ErrorHandlerConfig> = {
    [SaleErrorTypes.TRANSACTION_FAILED]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: () => {
        /* TODO: redirects to Immutascan to check the transaction if has is given */
        console.log({ transactionHash: viewState.view?.data?.transactionHash }); // eslint-disable-line no-console
      },
      statusType: StatusType.FAILURE,
      statusIconStyles: {
        fill: biomeTheme.color.status.destructive.dim,
      },
    },
    [SaleErrorTypes.SERVICE_BREAKDOWN]: {
      onSecondaryActionClick: () => sendCloseEvent(SaleErrorTypes.SERVICE_BREAKDOWN),
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.TRANSAK_FAILED]: {
      onActionClick: () => {
        /* TODO: start over the transak flow */
      },
      onSecondaryActionClick: () => sendCloseEvent(SaleErrorTypes.TRANSAK_FAILED),
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.WALLET_FAILED]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: () => sendCloseEvent(SaleErrorTypes.WALLET_FAILED),
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: () => sendCloseEvent(SaleErrorTypes.WALLET_REJECTED_NO_FUNDS),
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.WALLET_REJECTED]: {
      onActionClick: () => {
        goBackToPaymentMethods(PaymentTypes.CRYPTO);
      },
      onSecondaryActionClick: () => sendCloseEvent(SaleErrorTypes.WALLET_REJECTED),
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.SMART_CHECKOUT_NO_ROUTES_FOUND]: {
      onActionClick: () => {
        goBackToPaymentMethods();
      },
      onSecondaryActionClick: () => sendCloseEvent(SaleErrorTypes.SMART_CHECKOUT_NO_ROUTES_FOUND),
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.SMART_CHECKOUT_ERROR]: {
      onActionClick: () => {
        goBackToPaymentMethods();
      },
      onSecondaryActionClick: () => sendCloseEvent(SaleErrorTypes.SMART_CHECKOUT_ERROR),
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.DEFAULT]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: () => sendCloseEvent(SaleErrorTypes.DEFAULT),
      statusType: StatusType.INFORMATION,
    },
  };

  const getErrorViewProps = (): StatusViewProps => {
    const errorTextConfig: AllErrorTextConfigs = text.views[SaleWidgetViews.SALE_FAIL].errors;
    const errorType = viewState.view.data.errorType || SaleErrorTypes.DEFAULT;
    const handlers = errorHandlersConfig[errorType] || {};

    return {
      testId: 'fail-view',
      statusText: errorTextConfig[errorType].description,
      actionText: errorTextConfig[errorType]?.primaryAction,
      onActionClick: handlers?.onActionClick,
      secondaryActionText: errorTextConfig[errorType].secondaryAction,
      onSecondaryActionClick: handlers?.onSecondaryActionClick,
      onCloseClick: () => sendCloseEvent(errorType),
      statusType: handlers.statusType,
      statusIconStyles: {
        transform: 'rotate(180deg)',
        fill: biomeTheme.color.status.guidance.dim,
        ...handlers.statusIconStyles,
      },
    };
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
            passport: connectLoaderParams?.passport,
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
            <StatusView
              onRenderEvent={() => sendFailedEvent(
                viewState.view.data?.reason,
                viewState.view.data?.transactions,
                viewState.view.data?.paymentMethod,
                SaleWidgetViews.SALE_FAIL,
              )}
              {...getErrorViewProps()}
            />
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
                onRenderEvent={() => sendSuccessEvent(
                  viewState.view.data?.transactions,
                  viewState.view.data?.paymentMethod,
                  SaleWidgetViews.SALE_SUCCESS,
                )}
                onActionClick={() => sendCloseEvent(SaleWidgetViews.SALE_SUCCESS)}
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
