import { Web3Provider } from '@ethersproject/providers';
import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AddFundsWidgetParams, Checkout, IMTBLWidgetEvents } from '@imtbl/checkout-sdk';

import { sendAddFundsCloseEvent } from './AddFundsWidgetEvents';

import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  AddFundsActions, AddFundsContext, addFundsReducer, initialAddFundsState,
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
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { fetchChains } from './functions/fetchChains';
import { Review } from './views/Review';
import { useRoutes } from './hooks/useRoutes';
import { orchestrationEvents } from '../../lib/orchestrationEvents';

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
  const { fetchRoutesWithRateLimit } = useRoutes();

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
      if (!addFundsState.squid || !addFundsState.chains || !addFundsState.provider) return;

      console.log('=====TEST getInjectedProviders', addFundsState.checkout?.getInjectedProviders());
      console.log('=====TEST connection', addFundsState.provider?.connection);
      console.log('=====TEST isMetaMask', addFundsState.provider?.provider.isMetaMask);
      console.log('=====TEST host', addFundsState.provider?.provider.host);
      console.log('=====TEST path', addFundsState.provider?.provider.path);

      const chains = addFundsState.chains.filter((chain) => ['1', '10', '5000', '13371'].includes(chain.id));
      const chainIds = chains.map((chain) => chain.id);
      const fromAddress = await addFundsState.provider?.getSigner().getAddress();

      const balances = await addFundsState.squid?.getAllBalances({
        chainIds,
        evmAddress: fromAddress,
      });
      const filteredBalances = balances?.evmBalances?.filter(
        (balance) => balance.balance !== '0',
      );

      addFundsDispatch({
        payload: {
          type: AddFundsActions.SET_BALANCES,
          balances: filteredBalances ?? [],
        },
      });

      console.log('====== BALANCES ', filteredBalances);
      console.log('=====toTokenAddress', toTokenAddress);
      console.log('=====toAmount', toAmount);

      const routes = await fetchRoutesWithRateLimit(
        addFundsState.squid,
        filteredBalances ?? [],
        '13371',
        toTokenAddress ?? '"0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2"',
        toAmount ?? '10',
      );
      console.log('====== ROUTES', routes);
      const foundRoute = routes.find((r) => r.route !== undefined);
      console.log('====== ROUTE', foundRoute);
      if (!toTokenAddress || !toAmount || !foundRoute) {
        return;
      }
      console.log('====== DISPATCH');

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: AddFundsWidgetViews.REVIEW,
            data: {
              balance: foundRoute.amountData.balance,
              toChainId: '13371',
              toTokenAddress,
              toAmount,
              fromAddress,
            },
          },
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
              orchestrationEvents.sendRequestGoBackEvent(
                eventTarget,
                IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT,
                {},
              );
            }}
            showBackButton
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
