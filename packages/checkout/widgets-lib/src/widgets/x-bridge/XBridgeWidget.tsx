import {
  BridgeWidgetParams,
  Checkout,
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
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
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
import {
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
  SharedViews,
} from '../../context/view-context/ViewContext';
import {
  XBridgeContext,
  xBridgeReducer,
  initialXBridgeState,
  BridgeActions,
} from './context/XBridgeContext';
import { WalletNetworkSelectionView } from './views/WalletNetworkSelectionView';
import { Bridge } from './views/Bridge';
import { BridgeReview } from './views/BridgeReview';
import { MoveInProgress } from './views/MoveInProgress';
import { ApproveTransaction } from './views/ApproveTransaction';
import { ErrorView } from '../../views/error/ErrorView';
import { text } from '../../resources/text/textConfig';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { sendBridgeFailedEvent, sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';

export type BridgeWidgetInputs = BridgeWidgetParams & {
  config: StrongCheckoutWidgetsConfig,
  checkout: Checkout;
  web3Provider?: Web3Provider;
};

export function XBridgeWidget({
  checkout,
  web3Provider,
  config,
}: BridgeWidgetInputs) {
  const { environment } = config;
  const errorText = text.views[SharedViews.ERROR_VIEW];
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const bridgeFailureText = text.views[XBridgeWidgetViews.BRIDGE_FAILURE];

  const [viewState, viewDispatch] = useReducer(
    viewReducer,
    {
      ...initialViewState,
      view: { type: XBridgeWidgetViews.WALLET_NETWORK_SELECTION },
      history: [{ type: XBridgeWidgetViews.WALLET_NETWORK_SELECTION }],
    },
  );

  const [bridgeState, bridgeDispatch] = useReducer(
    xBridgeReducer,
    {
      ...initialXBridgeState,
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
        view: { type: XBridgeWidgetViews.WALLET_NETWORK_SELECTION },
      },
    });
  }, [viewDispatch]);

  const goBackToReview = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK_TO,
        view: { type: XBridgeWidgetViews.BRIDGE_REVIEW },
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
      <XBridgeContext.Provider value={bridgeReducerValues}>
        <CryptoFiatProvider environment={environment}>
          {viewState.view.type === XBridgeWidgetViews.WALLET_NETWORK_SELECTION && (
            <WalletNetworkSelectionView />
          )}
          {viewState.view.type === XBridgeWidgetViews.BRIDGE_FORM && (
            <Bridge />
          )}
          {viewState.view.type === XBridgeWidgetViews.BRIDGE_REVIEW && (
            <BridgeReview />
          )}
          {viewState.view.type === XBridgeWidgetViews.IN_PROGRESS && (
            <MoveInProgress
              transactionHash={viewState.view.transactionHash}
            />
          )}
          {viewState.view.type === XBridgeWidgetViews.BRIDGE_FAILURE && (
            <StatusView
              testId="bridge-fail"
              statusText={bridgeFailureText.statusText}
              actionText={bridgeFailureText.actionText}
              onActionClick={goBackToReview}
              statusType={StatusType.FAILURE}
              onRenderEvent={() => sendBridgeFailedEvent(eventTarget, viewState.view.data.reason)}
            />
          )}
          {viewState.view.type === XBridgeWidgetViews.APPROVE_TRANSACTION && (
            <ApproveTransaction data={viewReducerValues.viewState.view.data} />
          )}
          {viewState.view.type === SharedViews.ERROR_VIEW && (
            <ErrorView
              actionText={errorText.actionText}
              onActionClick={goBackToWalletNetworkSelector}
              onCloseClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
            />
          )}
        </CryptoFiatProvider>
      </XBridgeContext.Provider>
    </ViewContext.Provider>
  );
}
