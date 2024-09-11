import { AddFundsWidgetParams, Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  sendAddFundsCloseEvent,
  sendAddFundsGoBackEvent,
} from './AddFundsWidgetEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';

import {
  AddFundsActions, AddFundsContext,
} from './context/AddFundsContext';
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { AddFundsWidgetViews } from '../../context/view-context/AddFundsViewContextTypes';
import {
  initialViewState, SharedViews, ViewContext, viewReducer,
} from '../../context/view-context/ViewContext';
import { AddFunds } from './views/AddFunds';
import { ErrorView } from '../../views/error/ErrorView';
import { AddFundsContextProvider } from './context/AddFundsContextProvider';

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
  tokenAddress,
  amount,
}: AddFundsWidgetInputs) {
  const [viewState, viewDispatch] = useReducer(
    viewReducer,
    {
      ...initialViewState,
      view: { type: AddFundsWidgetViews.ADD_FUNDS },
      history: [{ type: AddFundsWidgetViews.ADD_FUNDS }],
    },
  );
  const { t } = useTranslation();
  const { page } = useAnalytics();

  const viewReducerValues = useMemo(
    () => ({
      viewState,
      viewDispatch,
    }),
    [viewState, viewReducer],
  );
  const { addFundsDispatch } = useContext(AddFundsContext);

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
      <AddFundsContextProvider>
        {viewState.view.type === AddFundsWidgetViews.ADD_FUNDS && (
        <AddFunds
          checkout={checkout}
          provider={web3Provider}
          tokenAddress={tokenAddress}
          amount={amount}
          showOnrampOption={showOnrampOption}
          showSwapOption={showSwapOption}
          showBridgeOption={showBridgeOption}
          onCloseButtonClick={() => sendAddFundsCloseEvent(eventTarget)}
          onBackButtonClick={() => sendAddFundsGoBackEvent(eventTarget)}
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
      </AddFundsContextProvider>
    </ViewContext.Provider>
  );
}
