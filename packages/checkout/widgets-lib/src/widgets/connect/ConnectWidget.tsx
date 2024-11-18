/* eslint-disable react/jsx-no-constructed-context-values */
import {
  ChainId,
  Checkout,
  ConnectWidgetParams,
  EIP6963ProviderInfo,
  WalletConnectManager as IWalletConnectManager,
  metaMaskProviderInfo,
  NamedBrowserProvider,
  passportProviderInfo,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectLoaderSuccess } from '../../components/ConnectLoader/ConnectLoaderSuccess';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { ConnectWidgetView, ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import {
  initialViewState,
  SharedViews,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { addProviderListenersForWidgetRoot, sendProviderUpdatedEvent } from '../../lib';
import { identifyUser } from '../../lib/analytics/identifyUser';
import { useWalletConnect } from '../../lib/hooks/useWalletConnect';
import {
  isMetaMaskProvider, isPassportProvider, isWalletConnectProvider,
} from '../../lib/provider';
import { isL1EthChainId, isZkEvmChainId } from '../../lib/utils';
import { WalletConnectManager, walletConnectProviderInfo } from '../../lib/walletConnect';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { ErrorView } from '../../views/error/ErrorView';
import { ServiceUnavailableErrorView } from '../../views/error/ServiceUnavailableErrorView';
import { LoadingView } from '../../views/loading/LoadingView';
import {
  sendCloseWidgetEvent,
  sendConnectFailedEvent,
  sendConnectSuccessEvent,
  sendWalletConnectProviderUpdatedEvent,
} from './connectWidgetEvents';
import {
  ConnectActions,
  ConnectContext,
  connectReducer,
  initialConnectState,
} from './context/ConnectContext';
import { ConnectWallet } from './views/ConnectWallet';
import { SwitchNetworkEth } from './views/SwitchNetworkEth';
import { SwitchNetworkZkEVM } from './views/SwitchNetworkZkEVM';

export type ConnectWidgetInputs = ConnectWidgetParams & {
  config: StrongCheckoutWidgetsConfig
  deepLink?: ConnectWidgetViews;
  sendSuccessEventOverride?: () => void;
  sendCloseEventOverride?: () => void;
  allowedChains?: ChainId[];
  checkout: Checkout;
  browserProvider?: NamedBrowserProvider;
  isCheckNetworkEnabled?: boolean;
  sendGoBackEventOverride?: () => void;
  showBackButton?: boolean;
};

export default function ConnectWidget({
  config,
  sendSuccessEventOverride,
  sendCloseEventOverride,
  browserProvider,
  checkout,
  targetWalletRdns,
  targetChainId,
  allowedChains,
  blocklistWalletRdns,
  deepLink = ConnectWidgetViews.CONNECT_WALLET,
  isCheckNetworkEnabled,
  sendGoBackEventOverride,
  showBackButton,
}: ConnectWidgetInputs) {
  const { t } = useTranslation();
  const { environment } = config;
  const { isWalletConnectEnabled, ethereumProvider } = useWalletConnect();

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

  const { identify, page, user } = useAnalytics();

  let targetChain = targetChainId;
  if (!targetChain) {
    targetChain = checkout.config.isProduction
      ? ChainId.IMTBL_ZKEVM_MAINNET
      : ChainId.IMTBL_ZKEVM_TESTNET;
  }

  useEffect(() => {
    if (!browserProvider) return;
    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER,
        provider: browserProvider,
      },
    });
  }, [browserProvider]);

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

  useEffect(() => {
    if (isWalletConnectEnabled) {
      sendWalletConnectProviderUpdatedEvent(
        eventTarget,
        ethereumProvider,
        WalletConnectManager.getInstance() as unknown as IWalletConnectManager,
      );
    }
  }, [isWalletConnectEnabled, ethereumProvider]);

  const handleConnectSuccess = useCallback(async () => {
    if (!provider) return;
    // WT-1698 Analytics - Identify user here
    page({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectSuccess',
    });
    // Set up EIP-1193 provider event listeners for widget root instances
    addProviderListenersForWidgetRoot(provider);

    const userData = user ? await user() : undefined;
    const anonymousId = userData?.anonymousId();

    await identifyUser(identify, provider, { anonymousId });
    sendProviderUpdatedEvent({ provider });

    // Find the wallet provider info via injected with Passport and MetaMask fallbacks
    let walletProviderInfo: EIP6963ProviderInfo | undefined;
    if (isWalletConnectProvider(provider.name)) {
      walletProviderInfo = walletConnectProviderInfo;
    } else if (isPassportProvider(provider.name)) {
      walletProviderInfo = passportProviderInfo;
    } else if (isMetaMaskProvider(provider.name)) {
      walletProviderInfo = metaMaskProviderInfo;
    }

    if (sendSuccessEventOverride) {
      sendSuccessEventOverride();
      return;
    }
    sendConnectSuccessEvent(eventTarget, provider, walletProviderName ?? undefined, walletProviderInfo);
  }, [provider, identify]);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <ConnectContext.Provider value={connectReducerValues}>
        <>
          {view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText="Loading" />
          )}
          {view.type === ConnectWidgetViews.CONNECT_WALLET && (
            <ConnectWallet
              targetWalletRdns={targetWalletRdns}
              targetChainId={targetChain}
              allowedChains={allowedChains ?? [targetChain]}
              blocklistWalletRdns={blocklistWalletRdns}
              checkNetwork={isCheckNetworkEnabled ?? true}
              showBackButton={showBackButton}
              onBackButtonClick={sendGoBackEventOverride}
            />
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
          {view.type === SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW && (
            <ServiceUnavailableErrorView
              onCloseClick={sendCloseEvent}
              onBackButtonClick={() => {
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                      type: ConnectWidgetViews.CONNECT_WALLET,
                    } as ConnectWidgetView,
                  },
                });
              }}
            />
          )}
        </>
      </ConnectContext.Provider>
    </ViewContext.Provider>
  );
}
