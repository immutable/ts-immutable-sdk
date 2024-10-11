import { Web3Provider } from '@ethersproject/providers';
import { AddFundsWidgetParams, Checkout } from '@imtbl/checkout-sdk';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';

import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { AddFundsWidgetViews } from '../../context/view-context/AddFundsViewContextTypes';
import {
  initialViewState,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { sendAddFundsCloseEvent } from './AddFundsWidgetEvents';
import {
  AddFundsActions, AddFundsContext, addFundsReducer, initialAddFundsState,
} from './context/AddFundsContext';
import { fetchBalances } from './functions/fetchBalances';
import { fetchChains } from './functions/fetchChains';
import { useSquid } from './hooks/useSquid';
import { useTokens } from './hooks/useTokens';
import { AddFunds } from './views/AddFunds';
import { Review } from './views/Review';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {
  checkout: Checkout;
  web3Provider?: Web3Provider;
  config: StrongCheckoutWidgetsConfig;
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
  config,
}: AddFundsWidgetInputs) {
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
    if (!tokensResponse) return;

    addFundsDispatch({
      payload: {
        type: AddFundsActions.SET_TOKENS,
        tokens: tokensResponse,
      },
    });
  }, [tokensResponse]);

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
      </AddFundsContext.Provider>
    </ViewContext.Provider>
  );
}
