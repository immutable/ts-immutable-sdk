import {
  BridgeWidgetParams,
  Checkout,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { CryptoFiatProvider } from 'context/crypto-fiat-context/CryptoFiatProvider';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { StatusView } from 'components/Status/StatusView';
import { StatusType } from 'components/Status/StatusType';
import { ImmutableConfiguration } from '@imtbl/config';
import {
  BridgeConfiguration,
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  ETH_SEPOLIA_TO_ZKEVM_TESTNET,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { getL1ChainId, getL2ChainId } from 'lib';
import { Transactions } from 'components/Transactions/Transactions';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { TopUpView } from 'views/top-up/TopUpView';
import { useTranslation } from 'react-i18next';
import { ClaimWithdrawalInProgress } from 'components/Transactions/ClaimWithdrawalInProgress';
import {
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
  SharedViews,
} from '../../context/view-context/ViewContext';
import {
  BridgeContext,
  bridgeReducer,
  initialBridgeState,
  BridgeActions,
} from './context/BridgeContext';
import { WalletNetworkSelectionView } from './views/WalletNetworkSelectionView';
import { Bridge } from './views/Bridge';
import { BridgeReview } from './views/BridgeReview';
import { MoveInProgress } from './views/MoveInProgress';
import { ApproveTransaction } from './views/ApproveTransaction';
import { ErrorView } from '../../views/error/ErrorView';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  sendBridgeClaimWithdrawalFailedEvent,
  sendBridgeClaimWithdrawalSuccessEvent,
  sendBridgeFailedEvent,
  sendBridgeWidgetCloseEvent,
} from './BridgeWidgetEvents';
import {
  BridgeClaimWithdrawalSuccess,
} from '../../context/view-context/BridgeViewContextTypes';
import { ClaimWithdrawal } from './views/ClaimWithdrawal';

export type BridgeWidgetInputs = BridgeWidgetParams & {
  config: StrongCheckoutWidgetsConfig,
  checkout: Checkout;
  web3Provider?: Web3Provider;
};

export function BridgeWidget({
  checkout,
  web3Provider,
  config,
  amount,
  tokenAddress,
}: BridgeWidgetInputs) {
  const { t } = useTranslation();
  const {
    environment,
    isOnRampEnabled,
    isSwapEnabled,
    isBridgeEnabled,
  } = config;
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { page } = useAnalytics();

  const [viewState, viewDispatch] = useReducer(
    viewReducer,
    {
      ...initialViewState,
      view: { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
      history: [{ type: BridgeWidgetViews.WALLET_NETWORK_SELECTION }],
    },
  );

  const [bridgeState, bridgeDispatch] = useReducer(
    bridgeReducer,
    {
      ...initialBridgeState,
      checkout,
      web3Provider: web3Provider ?? null,
      tokenBridge: (() => {
        let bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_TESTNET;
        if (checkout.config.isDevelopment) bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_DEVNET;
        if (checkout.config.isProduction) bridgeInstance = ETH_MAINNET_TO_ZKEVM_MAINNET;

        // Root provider is always L1
        const rootProvider = new JsonRpcProvider(
          checkout.config.networkMap.get(getL1ChainId(checkout.config))?.rpcUrls[0],
        );

        // Child provider is always L2
        const childProvider = new JsonRpcProvider(
          checkout.config.networkMap.get(getL2ChainId(checkout.config))?.rpcUrls[0],
        );
        const bridgeConfiguration = new BridgeConfiguration({
          baseConfig: new ImmutableConfiguration({ environment: checkout.config.environment }),
          bridgeInstance,
          rootProvider,
          childProvider,
        });

        return new TokenBridge(bridgeConfiguration);
      })(),
    },
  );

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
  const bridgeReducerValues = useMemo(() => ({ bridgeState, bridgeDispatch }), [bridgeState, bridgeDispatch]);

  const goBackToWalletNetworkSelector = useCallback(() => {
    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_WALLETS_AND_NETWORKS,
        from: null,
        to: null,
      },
    });
    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_TOKEN_AND_AMOUNT,
        amount: '',
        token: null,
      },
    });
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK_TO,
        view: { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
      },
    });
  }, [viewDispatch]);

  const goBackToReview = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK_TO,
        view: { type: BridgeWidgetViews.BRIDGE_REVIEW },
      },
    });
  }, [viewDispatch]);

  useEffect(() => {
    (async () => {
      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_PROVIDER,
          web3Provider: web3Provider ?? null,
        },
      });
    })();
  }, [web3Provider]);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <BridgeContext.Provider value={bridgeReducerValues}>
        <CryptoFiatProvider environment={environment}>
          {viewState.view.type === BridgeWidgetViews.WALLET_NETWORK_SELECTION && (
            <WalletNetworkSelectionView />
          )}
          {viewState.view.type === BridgeWidgetViews.BRIDGE_FORM && (
            <Bridge amount={amount} tokenAddress={tokenAddress} />
          )}
          {viewState.view.type === BridgeWidgetViews.BRIDGE_REVIEW && (
            <BridgeReview />
          )}
          {viewState.view.type === BridgeWidgetViews.IN_PROGRESS && (
            <MoveInProgress
              transactionHash={viewState.view.transactionHash}
            />
          )}
          {viewState.view.type === BridgeWidgetViews.BRIDGE_FAILURE
            && (
              <StatusView
                testId="bridge-fail"
                statusText={t('views.BRIDGE_FAILURE.bridgeFailureText.statusText')}
                actionText={t('views.BRIDGE_FAILURE.bridgeFailureText.actionText')}
                onActionClick={goBackToReview}
                statusType={StatusType.FAILURE}
                onRenderEvent={() => {
                  let reason = '';
                  if (viewState.view.type === BridgeWidgetViews.BRIDGE_FAILURE) {
                    reason = viewState.view.reason;
                  }

                  page({
                    userJourney: UserJourney.BRIDGE,
                    screen: 'Failed',
                    extras: {
                      reason,
                    },
                  });

                  sendBridgeFailedEvent(eventTarget, reason);
                }}
              />
            )}

          {viewState.view.type === BridgeWidgetViews.APPROVE_TRANSACTION && (
            <ApproveTransaction
              approveTransaction={viewState.view.approveTransaction}
              transaction={viewState.view.transaction}
            />
          )}
          {viewState.view.type === BridgeWidgetViews.TRANSACTIONS && (
            <Transactions onBackButtonClick={goBackToWalletNetworkSelector} />
          )}
          {viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL && (
            <ClaimWithdrawal transaction={viewState.view.transaction} />
          )}
          {viewState.view.type === SharedViews.ERROR_VIEW && (
            <ErrorView
              actionText={t('views.ERROR_VIEW.actionText')}
              onActionClick={goBackToWalletNetworkSelector}
              onCloseClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
              errorEventAction={() => {
                page({
                  userJourney: UserJourney.BRIDGE,
                  screen: 'Error',
                });
              }}
            />
          )}
          {viewState.view.type === SharedViews.TOP_UP_VIEW && (
            <TopUpView
              analytics={{ userJourney: UserJourney.BRIDGE }}
              widgetEvent={IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT}
              checkout={checkout}
              provider={web3Provider}
              showOnrampOption={isOnRampEnabled}
              showSwapOption={isSwapEnabled}
              showBridgeOption={isBridgeEnabled}
              onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
            />
          )}
          {viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_IN_PROGRESS && (
            <ClaimWithdrawalInProgress
              transactionResponse={viewState.view.data.transactionResponse}
            />
          )}
          {viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_SUCCESS && (
            <StatusView
              statusText={t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.success.text')}
              actionText={t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.success.actionText')}
              onRenderEvent={() => {
                page({
                  userJourney: UserJourney.BRIDGE,
                  screen: 'ClaimWithdrawalSuccess',
                });
                sendBridgeClaimWithdrawalSuccessEvent(
                  eventTarget,
                  (viewState.view as BridgeClaimWithdrawalSuccess).transactionHash,
                );
              }}
              onActionClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
              statusType={StatusType.SUCCESS}
              testId="claim-withdrawal-success-view"
            />
          )}
          {viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE && (
            <StatusView
              statusText={t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.failure.text')}
              actionText={t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.failure.actionText')}
              onRenderEvent={() => {
                let reason = '';
                if (viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE) {
                  reason = viewState.view.reason;
                }
                page({
                  userJourney: UserJourney.BRIDGE,
                  screen: 'ClaimWithdrawalFailure',
                  extras: {
                    reason,
                  },
                });
                sendBridgeClaimWithdrawalFailedEvent(eventTarget, 'Transaction failed');
              }}
              onActionClick={() => {
                if (viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE) {
                  viewDispatch({
                    payload: {
                      type: ViewActions.UPDATE_VIEW,
                      view: {
                        type: BridgeWidgetViews.TRANSACTIONS,
                      },
                    },
                  });
                }
              }}
              statusType={StatusType.FAILURE}
              onCloseClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
              testId="claim-withdrawal-fail-view"
            />
          )}
        </CryptoFiatProvider>
      </BridgeContext.Provider>
    </ViewContext.Provider>
  );
}
