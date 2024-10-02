import {
  useContext, useEffect, useMemo, useReducer,
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
import { Review } from './views/Review';
import { Confirmation } from './views/Confirmation';
import { fetchBalances } from './functions/fetchBalances';
import { useProvidersState } from '../../context/providers-context/ProvidersContext';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {};

export default function AddFundsWidget({
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  toTokenAddress,
  toAmount,
  showBackButton,
}: AddFundsWidgetInputs) {
  const { t } = useTranslation();
  const { page } = useAnalytics();
  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    view: { type: AddFundsWidgetViews.ADD_FUNDS },
    history: [{ type: AddFundsWidgetViews.ADD_FUNDS }],
  });

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
  const addFundsReducerValues = useMemo(
    () => ({
      addFundsState,
      addFundsDispatch,
    }),
    [addFundsState, addFundsDispatch],
  );
  
  const { squid, chains } = addFundsState;

  const { providersState: { checkout, fromProvider } } = useProvidersState();

  const squidSdk = useSquid(checkout);

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
    if (!squid || !chains || !fromProvider) return;

    (async () => {
      const evmChains = chains.filter((chain) => chain.type === 'evm');
      const balances = await fetchBalances(squid, evmChains, fromProvider);

      addFundsDispatch({
        payload: {
          type: AddFundsActions.SET_BALANCES,
          balances: balances ?? [],
        },
      });
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
        {viewState.view.type === AddFundsWidgetViews.CONFIRMATION && (
          <Confirmation
            data={viewState.view.data}
            onCloseClick={() => sendAddFundsCloseEvent(eventTarget)}
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
      </AddFundsContext.Provider>
    </ViewContext.Provider>
  );
}
