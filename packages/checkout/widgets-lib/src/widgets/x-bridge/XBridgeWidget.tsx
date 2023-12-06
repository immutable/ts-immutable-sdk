import {
  BiomeCombinedProviders,
} from '@biom3/react';
import {
  BridgeWidgetParams,
  Checkout,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
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
  ErrorView as ErrorViewType,
} from '../../context/view-context/ViewContext';
import {
  XBridgeContext,
  xBridgeReducer,
  initialXBridgeState,
} from './context/XBridgeContext';
import { widgetTheme } from '../../lib/theme';
import { WalletNetworkSelectionView } from './views/WalletNetworkSelectionView';
import { Bridge } from './views/Bridge';
import { BridgeReview } from './views/BridgeReview';
import { MoveInProgress } from './views/MoveInProgress';
import { ApproveTransaction } from './views/ApproveTransaction';
import { ErrorView } from '../../views/error/ErrorView';
import { sendBridgeWidgetCloseEvent } from '../bridge/BridgeWidgetEvents';
import { text } from '../../resources/text/textConfig';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';

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
  const { environment, theme } = config;
  const [errorViewLoading, setErrorViewLoading] = useState(false);
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
  const themeReducerValue = useMemo(() => widgetTheme(theme), [theme]);

  const goBackToReview = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK_TO,
        view: {
          type: XBridgeWidgetViews.BRIDGE_REVIEW,
        },
      },
    });
  }, [viewDispatch]);

  return (
    <BiomeCombinedProviders theme={{ base: themeReducerValue }}>
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
              <MoveInProgress />
            )}
            {viewState.view.type === XBridgeWidgetViews.BRIDGE_FAILURE && (
              <StatusView
                testId="bridge-fail"
                statusText={bridgeFailureText.statusText}
                actionText={bridgeFailureText.actionText}
                onActionClick={() => {
                  viewDispatch({
                    payload: {
                      type: ViewActions.GO_BACK_TO,
                      view: { type: XBridgeWidgetViews.BRIDGE_REVIEW },
                    },
                  });
                }}
                statusType={StatusType.FAILURE}
              />
            )}
            {viewState.view.type === XBridgeWidgetViews.APPROVE_TRANSACTION && (
              <ApproveTransaction data={viewReducerValues.viewState.view.data} />
            )}
            {viewState.view.type === SharedViews.ERROR_VIEW && (
              <ErrorView
                actionText={errorText.actionText}
                onActionClick={async () => {
                  setErrorViewLoading(true);
                  const data = viewState.view as ErrorViewType;

                  if (!data.tryAgain) {
                    goBackToReview();
                    setErrorViewLoading(false);
                    return;
                  }

                  if (await data.tryAgain()) goBackToReview();
                  setErrorViewLoading(false);
                }}
                onCloseClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
                errorEventActionLoading={errorViewLoading}
              />
            )}
          </CryptoFiatProvider>
        </XBridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
