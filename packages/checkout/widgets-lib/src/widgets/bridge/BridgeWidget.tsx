import {
  BridgeWidgetParams,
  Checkout,
  IMTBLWidgetEvents,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import {
  BridgeConfiguration,
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  ETH_SEPOLIA_TO_ZKEVM_TESTNET,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { useTranslation } from 'react-i18next';
import { ImmutableConfiguration } from '@imtbl/config';
import { JsonRpcProvider } from 'ethers';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { StatusView } from '../../components/Status/StatusView';
import { StatusType } from '../../components/Status/StatusType';
import { getL1ChainId, getL2ChainId } from '../../lib';
import { Transactions } from '../../components/Transactions/Transactions';
import { UserJourney, useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { TopUpView } from '../../views/top-up/TopUpView';
import { ClaimWithdrawalInProgress } from '../../components/Transactions/ClaimWithdrawalInProgress';
import { getDefaultTokenImage } from '../../lib/utils';
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
  BridgeClaimWithdrawalFailure,
  BridgeWidgetViews,
} from '../../context/view-context/BridgeViewContextTypes';
import { ClaimWithdrawal } from './views/ClaimWithdrawal';
import { ServiceUnavailableErrorView } from '../../views/error/ServiceUnavailableErrorView';

export type BridgeWidgetInputs = BridgeWidgetParams & {
  config: StrongCheckoutWidgetsConfig,
  checkout: Checkout;
  browserProvider?: WrappedBrowserProvider;
};

export default function BridgeWidget({
  checkout,
  browserProvider,
  config,
  amount,
  tokenAddress,
  showBackButton,
}: BridgeWidgetInputs) {
  const { t } = useTranslation();
  const {
    environment,
    isOnRampEnabled,
    isSwapEnabled,
    isBridgeEnabled,
    theme,
  } = config;
  const defaultTokenImage = getDefaultTokenImage(checkout.config.environment, theme);
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
      browserProvider: browserProvider ?? null,
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

  const goBackToWalletNetworkSelectorClearState = useCallback(() => {
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

  const goBackToWalletNetworkSelector = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK_TO,
        view: { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
      },
    });
  }, [viewDispatch]);

  const updateToTransactionsPage = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: BridgeWidgetViews.TRANSACTIONS,
        },
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
          browserProvider: browserProvider ?? null,
        },
      });
    })();
  }, [browserProvider]);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <BridgeContext.Provider value={bridgeReducerValues}>
        <CryptoFiatProvider environment={environment}>
          {viewState.view.type === BridgeWidgetViews.WALLET_NETWORK_SELECTION && (
            <WalletNetworkSelectionView showBackButton={showBackButton} />
          )}
          {viewState.view.type === BridgeWidgetViews.BRIDGE_FORM && (
            <Bridge
              amount={amount}
              tokenAddress={tokenAddress}
              defaultTokenImage={defaultTokenImage}
              theme={theme}
            />
          )}
          {viewState.view.type === BridgeWidgetViews.BRIDGE_REVIEW && (
            <BridgeReview />
          )}
          {viewState.view.type === BridgeWidgetViews.IN_PROGRESS && (
            <MoveInProgress
              transactionHash={viewState.view.transactionHash}
              isTransfer={viewState.view.isTransfer}
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
              bridgeTransaction={viewState.view.approveTransaction && viewState.view.transaction
                ? { approveTransaction: viewState.view.approveTransaction, transaction: viewState.view.transaction }
                : undefined}
            />
          )}
          {viewState.view.type === BridgeWidgetViews.TRANSACTIONS && (
            <Transactions onBackButtonClick={goBackToWalletNetworkSelector} defaultTokenImage={defaultTokenImage} />
          )}
          {viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL && (
            <ClaimWithdrawal transaction={viewState.view.transaction} />
          )}
          {viewState.view.type === SharedViews.ERROR_VIEW && (
            <ErrorView
              actionText={t('views.ERROR_VIEW.actionText')}
              onActionClick={goBackToWalletNetworkSelectorClearState}
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
              provider={browserProvider}
              showOnrampOption={isOnRampEnabled}
              showSwapOption={isSwapEnabled}
              showBridgeOption={isBridgeEnabled}
              onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
            />
          )}
          {viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_IN_PROGRESS && (
            <ClaimWithdrawalInProgress
              transactionResponse={viewState.view.transactionResponse}
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
              onActionClick={updateToTransactionsPage}
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
                sendBridgeClaimWithdrawalFailedEvent(
                  eventTarget,
                  (viewState.view as BridgeClaimWithdrawalFailure).transactionHash,
                  'Transaction failed',
                );
              }}
              onActionClick={updateToTransactionsPage}
              statusType={StatusType.FAILURE}
              onCloseClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
              testId="claim-withdrawal-fail-view"
            />
          )}
          {viewState.view.type === BridgeWidgetViews.SERVICE_UNAVAILABLE && (
            <ServiceUnavailableErrorView
              onCloseClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
              onBackButtonClick={() => {
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
                  },
                });
              }}
            />
          )}
        </CryptoFiatProvider>
      </BridgeContext.Provider>
    </ViewContext.Provider>
  );
}
