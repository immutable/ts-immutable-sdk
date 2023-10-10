/* eslint-disable no-console */
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
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  PrimaryRevenueWidgetViews,
} from '../../context/view-context/PrimaryRevenueViewContextTypes';
import { widgetTheme } from '../../lib/theme';
import { sendPrimaryRevenueWidgetCloseEvent } from './PrimaryRevenueWidgetEvents';
import { SharedContextProvider } from './context/SharedContextProvider';
import { Item, MintErrorTypes } from './types';
import { FundWithSmartCheckout } from './views/FundWithSmartCheckout';
import { PayWithCard } from './views/PayWithCard';
import { PayWithCoins } from './views/PayWithCoins';
import { PaymentMethods } from './views/PaymentMethods';

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

type AllErrorTextConfigs = Record<MintErrorTypes, ErrorTextConfig>;

export interface PrimaryRevenueWidgetProps {
  config: StrongCheckoutWidgetsConfig;
  amount: string;
  items: Item[];
  fromContractAddress: string;
  env: string;
  environmentId: string;
  connectLoaderParams?: ConnectLoaderParams;
}

export function PrimaryRevenueWidget(props: PrimaryRevenueWidgetProps) {
  const {
    config,
    amount,
    items,
    fromContractAddress,
    env,
    environmentId,
    connectLoaderParams,
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

  const { theme } = config;
  const biomeTheme = useMemo(() => widgetTheme(theme), [theme]);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const loadingText = viewState.view.data?.loadingText
    || text.views[SharedViews.LOADING_VIEW].text;

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

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

  const updateToPaymentMethods = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: PrimaryRevenueWidgetViews.PAYMENT_METHODS,
        },
      },
    });
  };

  const closeWidget = () => {
    sendPrimaryRevenueWidgetCloseEvent(eventTarget);
  };

  const errorHandlersConfig: Record<MintErrorTypes, ErrorHandlerConfig> = {
    [MintErrorTypes.TRANSACTION_FAILED]: {
      onActionClick: updateToPaymentMethods,
      onSecondaryActionClick: () => {
        /* TODO: redirects to Immutascan to check the transaction */
      },
      statusType: StatusType.FAILURE,
      statusIconStyles: {
        fill: biomeTheme.color.status.destructive.dim,
      },
    },
    [MintErrorTypes.SERVICE_BREAKDOWN]: {
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [MintErrorTypes.TRANSAK_FAILED]: {
      onActionClick: () => {
        /* TODO: start over the transak flow */
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [MintErrorTypes.PASSPORT_FAILED]: {
      onActionClick: updateToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [MintErrorTypes.PASSPORT_REJECTED_NO_FUNDS]: {
      onActionClick: updateToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [MintErrorTypes.PASSPORT_REJECTED]: {
      onActionClick: () => {
        /* TODO: trigger the approve and execute flow pop up flow again */
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [MintErrorTypes.DEFAULT]: {
      onActionClick: updateToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
  };

  const errorViewProps = useMemo<StatusViewProps>(() => {
    const errorTextConfig: AllErrorTextConfigs = text.views[PrimaryRevenueWidgetViews.MINT_FAIL].errors;
    const errorType = viewState.view.data?.error || MintErrorTypes.DEFAULT;
    const handlers = errorHandlersConfig[errorType] || {};
    return {
      testId: 'fail-view',
      statusText: errorTextConfig[errorType].description,
      actionText: errorTextConfig[errorType]?.primaryAction,
      onActionClick: handlers?.onActionClick,
      secondaryActionText: errorTextConfig[errorType].secondaryAction,
      onSecondaryActionClick: handlers?.onSecondaryActionClick,
      onCloseClick: closeWidget,
      statusType: handlers.statusType,
      statusIconStyles: {
        transform: 'rotate(180deg)',
        fill: biomeTheme.color.status.guidance.dim,
        ...handlers.statusIconStyles,
      },
    };
  }, [viewState.view.data?.error]);

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
            passport: connectLoaderParams?.passport,
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
          {viewState.view.type === PrimaryRevenueWidgetViews.MINT_FAIL && (
            <StatusView {...errorViewProps} />
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
                onActionClick={() => closeWidget()}
                statusType={StatusType.SUCCESS}
                testId="success-view"
              />
          )}
          {viewState.view.type === PrimaryRevenueWidgetViews.FUND_WITH_SMART_CHECKOUT && (
            <FundWithSmartCheckout subView={viewState.view.subView} />
          )}
        </SharedContextProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
