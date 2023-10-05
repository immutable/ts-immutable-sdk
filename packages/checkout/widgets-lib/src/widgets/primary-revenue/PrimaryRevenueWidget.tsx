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
import { Item, MintErrorTypes } from './types';
import { widgetTheme } from '../../lib/theme';
import { SharedContextProvider } from './context/SharedContextProvider';
import { PaymentMethods } from './views/PaymentMethods';
import { PayWithCard } from './views/PayWithCard';
import { PayWithCoins } from './views/PayWithCoins';
import {
  StatusView,
  StatusViewProps,
} from '../../components/Status/StatusView';
import { StatusType } from '../../components/Status/StatusType';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { sendPrimaryRevenueWidgetCloseEvent } from './PrimaryRevenueWidgetEvents';

interface ErrorHandlerConfig {
  onActionClick?: () => void;
  onSecondaryActionClick?: () => void;
  statusType: StatusType;
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
        /* redirects to Immutascan to check the transaction */
      },
      statusType: StatusType.FAILURE,
    },
    [MintErrorTypes.SERVICE_BREAKDOWN]: {
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.WARNING,
    },
    [MintErrorTypes.TRANSAK_FAILED]: {
      onActionClick: () => {
        /* TODO: start over the transak flow */
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.WARNING,
    },
    [MintErrorTypes.PASSPORT_FAILED]: {
      onActionClick: updateToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.WARNING,
    },
    [MintErrorTypes.PASSPORT_REJECTED_NO_FUNDS]: {
      onActionClick: updateToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.WARNING,
    },
    [MintErrorTypes.PASSPORT_REJECTED]: {
      onActionClick: () => {
        /* TODO: trigger the approve and execute flow pop up flow again */
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.WARNING,
    },
    [MintErrorTypes.DEFAULT]: {
      onActionClick: updateToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
  };

  const determineStatusViewProps = (): StatusViewProps => {
    const errorTextConfig: AllErrorTextConfigs = text.views[PrimaryRevenueWidgetViews.MINT_FAIL].errors;
    const errorType = viewState.view.data?.error || MintErrorTypes.DEFAULT;

    const handlers = errorHandlersConfig[errorType] || {};

    return {
      statusText: errorTextConfig[errorType].description,
      actionText: errorTextConfig[errorType]?.primaryAction,
      onActionClick: handlers?.onActionClick,
      secondaryActionText: errorTextConfig[errorType].secondaryAction,
      onSecondaryActionClick: handlers?.onSecondaryActionClick,
      onCloseClick: closeWidget,
      statusType: handlers.statusType,
      testId: 'fail-view',
    };
  };

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
          {viewState.view.type === PrimaryRevenueWidgetViews.MINT_FAIL && (
            <StatusView {...determineStatusViewProps()} />
          )}
        </SharedContextProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
