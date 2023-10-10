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
import { Item, MintErrorTypes, PaymentTypes } from './types';
import { widgetTheme } from '../../lib/theme';
import { SharedContextProvider } from './context/SharedContextProvider';
import { PaymentMethods } from './views/PaymentMethods';
import { PayWithCard } from './views/PayWithCard';
import { PayWithCoins } from './views/PayWithCoins';
import { ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { StatusView, StatusViewProps } from '../../components/Status/StatusView';
import { StatusType } from '../../components/Status/StatusType';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { sendPrimaryRevenueWidgetCloseEvent } from './PrimaryRevenueWidgetEvents';

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

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const { theme } = config;
  const biomeTheme = useMemo(() => widgetTheme(theme), [theme]);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const loadingText = viewState.view.data?.loadingText
    || text.views[SharedViews.LOADING_VIEW].text;

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
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

  const goBackToPaymentMethods = (type?: PaymentTypes | undefined) => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: PrimaryRevenueWidgetViews.PAYMENT_METHODS,
          data: { paymentMethod: type },
        },
      },
    });
  };

  const closeWidget = () => {
    sendPrimaryRevenueWidgetCloseEvent(eventTarget);
  };

  const errorHandlersConfig: Record<MintErrorTypes, ErrorHandlerConfig> = {
    [MintErrorTypes.TRANSACTION_FAILED]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: () => {
        /* TODO: redirects to Immutascan to check the transaction */
        console.log({ transactionHash: viewState.view?.data?.transactionHash });
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
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [MintErrorTypes.PASSPORT_FAILED]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [MintErrorTypes.PASSPORT_REJECTED_NO_FUNDS]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [MintErrorTypes.PASSPORT_REJECTED]: {
      onActionClick: () => {
        goBackToPaymentMethods(PaymentTypes.CRYPTO);
        /* TODO: trigger the approve and execute flow pop up flow again */
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [MintErrorTypes.DEFAULT]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
  };

  const getErrorViewProps = (): StatusViewProps => {
    const errorTextConfig: AllErrorTextConfigs = text.views[PrimaryRevenueWidgetViews.MINT_FAIL].errors;
    const errorType = viewState.view.data.errorType || MintErrorTypes.DEFAULT;
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
            passport: connectLoaderParams?.passport,
          }}
        >
          {viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} showFooterLogo />
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
            <StatusView {...getErrorViewProps()} />
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
        </SharedContextProvider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
