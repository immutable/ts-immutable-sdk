/* eslint-disable react/jsx-no-constructed-context-values */
import React, {
  useContext, useMemo, useEffect, useReducer, useCallback,
} from 'react';
import {
  ChainId,
  Checkout, ConnectWidgetParams,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';
import { isL1EthChainId, isZkEvmChainId } from 'lib/utils';
import {
  sendCloseWidgetEvent,
  sendConnectFailedEvent,
  sendConnectSuccessEvent,
} from './connectWidgetEvents';
import {
  ConnectActions,
  ConnectContext,
  connectReducer,
  initialConnectState,
} from './context/ConnectContext';
import { ConnectWidgetView, ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { ConnectWallet } from './views/ConnectWallet';
import { ReadyToConnect } from './views/ReadyToConnect';
import { SwitchNetworkZkEVM } from './views/SwitchNetworkZkEVM';
import { LoadingView } from '../../views/loading/LoadingView';
import { ConnectLoaderSuccess } from '../../components/ConnectLoader/ConnectLoaderSuccess';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
  SharedViews,
} from '../../context/view-context/ViewContext';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { addProviderListenersForWidgetRoot, sendProviderUpdatedEvent } from '../../lib';
import { SwitchNetworkEth } from './views/SwitchNetworkEth';
import { ErrorView } from '../../views/error/ErrorView';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { identifyUser } from '../../lib/analytics/identifyUser';

export type ConnectWidgetInputs = ConnectWidgetParams & {
  config: StrongCheckoutWidgetsConfig
  deepLink?: ConnectWidgetViews;
  sendCloseEventOverride?: () => void;
  allowedChains?: ChainId[];
  checkout: Checkout;
  web3Provider?: Web3Provider;
};

export default function ConnectWidget({
  config,
  sendCloseEventOverride,
  web3Provider,
  checkout,
  targetChainId,
  allowedChains,
  deepLink = ConnectWidgetViews.CONNECT_WALLET,
}: ConnectWidgetInputs) {
  const { t } = useTranslation();
  const { environment } = config;

  const errorText = t('views.ERROR_VIEW.actionText');

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const [connectState, connectDispatch] = useReducer(connectReducer, initialConnectState);
  const { sendCloseEvent, provider, walletProviderName } = connectState;

  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    history: [],
  });
  const { view } = viewState;

  const connectReducerValues = useMemo(
    () => ({ connectState, connectDispatch }),
    [connectState, connectDispatch],
  );
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const { identify, page } = useAnalytics();

  let targetChain = targetChainId;
  if (!targetChain) {
    targetChain = checkout.config.isProduction
      ? ChainId.IMTBL_ZKEVM_MAINNET
      : ChainId.IMTBL_ZKEVM_TESTNET;
  }

  useEffect(() => {
    if (!web3Provider) return;
    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER,
        provider: web3Provider,
      },
    });
  }, [web3Provider]);

  useEffect(() => {
    connectDispatch({
      payload: {
        type: ConnectActions.SET_CHECKOUT,
        checkout,
      },
    });

    if (checkout.passport) {
      connectDispatch({
        payload: {
          type: ConnectActions.SET_PASSPORT,
          passport: checkout.passport,
        },
      });
    }

    connectDispatch({
      payload: {
        type: ConnectActions.SET_SEND_CLOSE_EVENT,
        sendCloseEvent: sendCloseEventOverride ?? (() => sendCloseWidgetEvent(eventTarget)),
      },
    });
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: deepLink,
        } as ConnectWidgetView,
      },
    });
  }, [deepLink, sendCloseEventOverride, environment]);

  useEffect(() => {
    if (viewState.view.type !== SharedViews.ERROR_VIEW) return;
    sendConnectFailedEvent(eventTarget, viewState.view.error.message);
  }, [viewState]);

  const handleConnectSuccess = useCallback(async () => {
    if (!provider) return;
    // WT-1698 Analytics - Identify user here
    page({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectSuccess',
    });
    // Set up EIP-1193 provider event listeners for widget root instances
    addProviderListenersForWidgetRoot(provider);
    await identifyUser(identify, provider);
    sendProviderUpdatedEvent({ provider });
    sendConnectSuccessEvent(eventTarget, provider, walletProviderName ?? undefined);
  }, [provider, identify]);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <ConnectContext.Provider value={connectReducerValues}>
        <>
          {view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText="Loading" />
          )}
          {view.type === ConnectWidgetViews.CONNECT_WALLET && (
            <ConnectWallet targetChainId={targetChain} />
          )}
          {view.type === ConnectWidgetViews.READY_TO_CONNECT && (
            <ReadyToConnect targetChainId={targetChain} allowedChains={allowedChains ?? [targetChain]} />
          )}
          {view.type === ConnectWidgetViews.SWITCH_NETWORK && isZkEvmChainId(targetChain) && (
            <SwitchNetworkZkEVM />
          )}
          {view.type === ConnectWidgetViews.SWITCH_NETWORK && isL1EthChainId(targetChain) && (
            <SwitchNetworkEth />
          )}
          {view.type === ConnectWidgetViews.SUCCESS && provider && (
            <ConnectLoaderSuccess>
              <StatusView
                statusText={t('views.CONNECT_SUCCESS.status')}
                actionText={t('views.CONNECT_SUCCESS.action')}
                onActionClick={() => sendCloseEvent()}
                onRenderEvent={handleConnectSuccess}
                statusType={StatusType.SUCCESS}
                testId="success-view"
              />
            </ConnectLoaderSuccess>
          )}
          {((view.type === ConnectWidgetViews.SUCCESS && !provider)
            || view.type === SharedViews.ERROR_VIEW)
            && (
              <ErrorView
                actionText={errorText}
                onActionClick={() => {
                  viewDispatch({
                    payload: {
                      type: ViewActions.UPDATE_VIEW,
                      view: {
                        type: ConnectWidgetViews.CONNECT_WALLET,
                      } as ConnectWidgetView,
                    },
                  });
                }}
                onCloseClick={() => sendCloseEvent()}
              />
            )}
        </>
      </ConnectContext.Provider>
    </ViewContext.Provider>
  );
}
