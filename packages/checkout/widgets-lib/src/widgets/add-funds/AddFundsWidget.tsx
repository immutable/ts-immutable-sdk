import { Web3Provider } from '@ethersproject/providers';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AddFundsWidgetParams, Checkout } from '@imtbl/checkout-sdk';

import { sendAddFundsCloseEvent } from './AddFundsWidgetEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  AddFundsActions, AddFundsContext, addFundsReducer, initialAddFundsState,
} from './context/AddFundsContext';
import { AddFundsWidgetViews } from '../../context/view-context/AddFundsViewContextTypes';
import {
  initialViewState,
  SharedViews, ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { AddFunds } from './views/AddFunds';
import { ErrorView } from '../../views/error/ErrorView';
import { useSquid } from './hooks/useSquid';
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { fetchChains } from './functions/fetchChains';
import { Review } from './views/Review';
import { Confirmation } from './views/Confirmation';
import { fetchBalances } from './functions/fetchBalances';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {
  checkout: Checkout;
  web3Provider?: Web3Provider;
};

export default function AddFundsWidget({
  checkout,
  web3Provider,
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  toTokenAddress,
  toAmount,
  showBackButton,
}: AddFundsWidgetInputs) {
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

  const [addFundsState, addFundsDispatch] = useReducer(addFundsReducer, initialAddFundsState);

  const {
    squid, provider, chains,
  } = addFundsState;

  const addFundsReducerValues = useMemo(
    () => ({
      addFundsState,
      addFundsDispatch,
    }),
    [addFundsState, addFundsDispatch],
  );

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
    if (!squid || !chains || !provider) return;

    (async () => {
      const evmChains = chains.filter((chain) => chain.type === 'evm');
      const balances = await fetchBalances(squid, evmChains, provider);

      addFundsDispatch({
        payload: {
          type: AddFundsActions.SET_BALANCES,
          balances: balances ?? [],
        },
      });
    })();
  }, [squid, chains, provider]);

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
    if (!web3Provider) return;
    addFundsDispatch({
      payload: {
        type: AddFundsActions.SET_PROVIDER,
        provider: web3Provider,
      },
    });
  }, [web3Provider]);

  useEffect(() => {
    if (!checkout) return;
    addFundsDispatch({
      payload: {
        type: AddFundsActions.SET_CHECKOUT,
        checkout,
      },
    });
  }, [checkout]);

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
