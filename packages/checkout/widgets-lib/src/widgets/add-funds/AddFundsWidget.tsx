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
  SharedViews,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { AddFunds } from './views/AddFunds';
import { ErrorView } from '../../views/error/ErrorView';
import { useSquid } from './hooks/useSquid';
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { fetchChains } from './functions/fetchChains';

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

  const addFundsReducerValues = useMemo(
    () => ({
      addFundsState,
      addFundsDispatch,
    }),
    [addFundsState, addFundsDispatch],
  );

  const squid = useSquid(checkout);

  useEffect(() => {
    (async () => {
      const chains = await fetchChains();

      addFundsDispatch({
        payload: {
          type: AddFundsActions.SET_CHAINS,
          chains,
        },
      });
    })();
  }, []);

  useEffect(() => {
    if (!addFundsState.squid || !addFundsState.chains || !addFundsState.provider) return;

    (async () => {
      const chainIds = addFundsState.chains.map((chain) => chain.id);
      const fromAddress = await addFundsState.provider?.getSigner().getAddress();

      const balances = await addFundsState.squid?.getAllBalances({
        chainIds,
        evmAddress: fromAddress,
      });
      addFundsDispatch({
        payload: {
          type: AddFundsActions.SET_BALANCES,
          balances: balances?.evmBalances ?? [],
        },
      });
    })();
  }, [addFundsState.squid, addFundsState.chains, addFundsState.provider]);

  useEffect(() => {
    if (!squid || addFundsState.squid) return;

    addFundsDispatch({
      payload: {
        type: AddFundsActions.SET_SQUID,
        squid,
      },
    });
  }, [squid]);

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

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <AddFundsContext.Provider value={addFundsReducerValues}>
        {viewState.view.type === AddFundsWidgetViews.ADD_FUNDS && (
          <AddFunds
            checkout={checkout}
            provider={web3Provider}
            toTokenAddress={toTokenAddress}
            toAmount={toAmount}
            showBackButton={showBackButton}
            showOnrampOption={showOnrampOption}
            showSwapOption={showSwapOption}
            showBridgeOption={showBridgeOption}
            onCloseButtonClick={() => sendAddFundsCloseEvent(eventTarget)}
          />
        )}
        {viewState.view.type === SharedViews.ERROR_VIEW && (
          <ErrorView
            actionText={t('views.ERROR_VIEW.actionText')}
            onActionClick={() => undefined}
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
