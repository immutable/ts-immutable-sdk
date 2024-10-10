import {
  useContext, useEffect, useMemo, useReducer, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AddFundsWidgetParams } from '@imtbl/checkout-sdk';

import { sendAddFundsCloseEvent } from './AddFundsWidgetEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  AddFundsActions,
  AddFundsContext,
  addFundsReducer,
  initialAddFundsState,
} from './context/AddFundsContext';
import { AddFundsWidgetViews } from '../../context/view-context/AddFundsViewContextTypes';
import {
  initialViewState,
  SharedViews,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { AddFunds } from './views/AddFunds';
import { ErrorView } from '../../views/error/ErrorView';
import { useSquid } from './hooks/useSquid';
import {
  useAnalytics,
  UserJourney,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { fetchChains } from './functions/fetchChains';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { Review } from './views/Review';
import { fetchBalances } from './functions/fetchBalances';
import { useTokens } from './hooks/useTokens';
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';
import { ServiceUnavailableErrorView } from '../../views/error/ServiceUnavailableErrorView';
import { ServiceType } from '../../views/error/serviceTypes';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
};

export default function AddFundsWidget({
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  toTokenAddress,
  toAmount,
  showBackButton,
  config,
}: AddFundsWidgetInputs) {
  const fetchingBalances = useRef(false);

  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    view: { type: AddFundsWidgetViews.ADD_FUNDS },
    history: [{ type: AddFundsWidgetViews.ADD_FUNDS }],
  });
  const { t } = useTranslation();
  const { page } = useAnalytics();

  const viewReducerValues = useMemo(
    () => ({
      viewState,
      viewDispatch,
    }),
    [viewState, viewReducer],
  );

  const [addFundsState, addFundsDispatch] = useReducer(
    addFundsReducer,
    initialAddFundsState,
  );

  const {
    providersState: { checkout, fromProvider },
  } = useProvidersContext();

  const { squid, chains } = addFundsState;

  const addFundsReducerValues = useMemo(
    () => ({
      addFundsState,
      addFundsDispatch,
    }),
    [addFundsState, addFundsDispatch],
  );

  const squidSdk = useSquid(checkout);
  const tokensResponse = useTokens(checkout);

  useEffect(() => {
    (async () => {
      const chainsResponse = await fetchChains();

      addFundsDispatch({
        payload: {
          type: AddFundsActions.SET_CHAINS,
          chains: chainsResponse,
        },
      });
    })();
  }, []);

  useEffect(() => {
    if (!squid || !chains || !fromProvider || fetchingBalances.current) return;

    (async () => {
      try {
        fetchingBalances.current = true;
        const evmChains = chains.filter((chain) => chain.type === 'evm');
        const balances = await fetchBalances(squid, evmChains, fromProvider);

        addFundsDispatch({
          payload: {
            type: AddFundsActions.SET_BALANCES,
            balances,
          },
        });
      } finally {
        fetchingBalances.current = false;
      }
    })();
  }, [squid, chains, fromProvider]);

  useEffect(() => {
    if (!squidSdk) return;

    addFundsDispatch({
      payload: {
        type: AddFundsActions.SET_SQUID,
        squid: squidSdk,
      },
    });
  }, [squidSdk]);

  useEffect(() => {
    if (!tokensResponse) return;

    addFundsDispatch({
      payload: {
        type: AddFundsActions.SET_TOKENS,
        tokens: tokensResponse,
      },
    });
  }, [tokensResponse]);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const errorAction = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: AddFundsWidgetViews.ADD_FUNDS },
      },
    });
  };

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <AddFundsContext.Provider value={addFundsReducerValues}>
        {viewState.view.type === AddFundsWidgetViews.ADD_FUNDS && (
          <AddFunds
            config={config}
            checkout={checkout}
            toTokenAddress={toTokenAddress}
            toAmount={toAmount}
            showBackButton={showBackButton}
            showOnrampOption={showOnrampOption}
            showSwapOption={showSwapOption}
            showBridgeOption={showBridgeOption}
            onCloseButtonClick={() => sendAddFundsCloseEvent(eventTarget)}
          />
        )}
        {viewState.view.type === AddFundsWidgetViews.REVIEW && (
          <Review
            data={viewState.view.data}
            onCloseButtonClick={() => sendAddFundsCloseEvent(eventTarget)}
            onBackButtonClick={() => {
              viewDispatch({
                payload: {
                  type: ViewActions.GO_BACK,
                },
              });
            }}
            showBackButton
          />
        )}
        {viewState.view.type === SharedViews.ERROR_VIEW && (
          <ErrorView
            actionText={t('views.ERROR_VIEW.actionText')}
            onActionClick={errorAction}
            onCloseClick={() => sendAddFundsCloseEvent(eventTarget)}
            errorEventAction={() => {
              page({
                userJourney: UserJourney.ADD_FUNDS,
                screen: 'Error',
              });
            }}
          />
        )}
        {viewState.view.type === SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW && (
        <ServiceUnavailableErrorView
          service={ServiceType.GENERIC}
          onCloseClick={() => sendAddFundsCloseEvent(eventTarget)}
        />
        )}
      </AddFundsContext.Provider>
    </ViewContext.Provider>
  );
}
