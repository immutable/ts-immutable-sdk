import {
  BiomeCombinedProviders,
} from '@biom3/react';
import {
  NetworkFilterTypes, TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect, useMemo, useReducer, useState,
} from 'react';
import { ImmutableConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';
import {
  BridgeConfiguration,
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  ETH_SEPOLIA_TO_ZKEVM_TESTNET,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import {
  DEFAULT_BALANCE_RETRY_POLICY,
  getL1ChainId,
  getL2ChainId,
} from '../../lib';
import {
  ErrorView as ErrorViewType,
  SharedViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import {
  BridgeActions, BridgeContext, bridgeReducer, initialBridgeState,
} from './context/BridgeContext';
import { LoadingView } from '../../views/loading/LoadingView';
import { sendBridgeFailedEvent, sendBridgeSuccessEvent, sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';
import { BridgeSuccessView, BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { Bridge } from './views/Bridge';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { MoveInProgress } from './views/MoveInProgress';
import { text } from '../../resources/text/textConfig';
import { ErrorView } from '../../views/error/ErrorView';
import { ApproveERC20BridgeOnboarding } from './views/ApproveERC20Bridge';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { GetAllowedBalancesResultType, getAllowedBalances } from '../../lib/balance';
import { widgetTheme } from '../../lib/theme';
import { BridgeWidgetInputs } from './BridgeWidgetRoot';

export function BridgeWidget(props: BridgeWidgetInputs) {
  const { amount, fromContractAddress, config } = props;
  const { environment, theme } = config;
  const successText = text.views[BridgeWidgetViews.SUCCESS];
  const failText = text.views[BridgeWidgetViews.FAIL];
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;
  const errorText = text.views[SharedViews.ERROR_VIEW];

  const { connectLoaderState: { checkout, provider } } = useContext(ConnectLoaderContext);
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const [bridgeState, bridgeDispatch] = useReducer(bridgeReducer, initialBridgeState);

  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );
  const bridgeReducerValues = useMemo(
    () => ({ bridgeState, bridgeDispatch }),
    [bridgeState, bridgeDispatch],
  );
  const themeReducerValue = useMemo(() => widgetTheme(theme), [theme]);

  const [errorViewLoading, setErrorViewLoading] = useState(false);

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const showErrorView = useCallback((error: any, tryAgain?: () => Promise<boolean>) => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SharedViews.ERROR_VIEW,
          tryAgain,
          error,
        },
      },
    });
  }, [viewDispatch]);

  const showBridgeView = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: BridgeWidgetViews.BRIDGE },
      },
    });
  }, [viewDispatch]);

  const loadBalances = async (): Promise<boolean> => {
    if (!checkout) throw new Error('loadBalances: missing checkout');
    if (!provider) throw new Error('loadBalances: missing provider');

    let tokensAndBalances: GetAllowedBalancesResultType = {
      allowList: { tokens: [] },
      allowedBalances: [],
    };
    try {
      tokensAndBalances = await getAllowedBalances({
        checkout,
        provider,
        allowTokenListType: TokenFilterTypes.BRIDGE,
      });
    } catch (err: any) {
      if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable!(err)) {
        showErrorView(err, loadBalances);
        return false;
      }
    }

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_ALLOWED_TOKENS,
        allowedTokens: tokensAndBalances.allowList.tokens,
      },
    });

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_TOKEN_BALANCES,
        tokenBalances: tokensAndBalances.allowedBalances,
      },
    });

    return true;
  };

  useEffect(() => {
    const bridgetWidgetSetup = async () => {
      if (!checkout || !provider) return;

      const getNetworkResult = await checkout.getNetworkInfo({ provider });

      /* If the provider's network is not supported, return out of this and let the
      connect loader handle the switch network functionality */
      if (!getNetworkResult.isSupported) {
        return;
      }

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_NETWORK,
          network: getNetworkResult,
        },
      });

      const rootProvider = new ethers.providers.JsonRpcProvider(
        checkout.config.networkMap.get(getL1ChainId(checkout.config))?.rpcUrls[0],
      );

      const toChainId = getL2ChainId(checkout.config);

      const childProvider = new ethers.providers.JsonRpcProvider(
        checkout.config.networkMap.get(toChainId)?.rpcUrls[0],
      );

      let bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_TESTNET;
      if (checkout.config.isDevelopment) bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_DEVNET;
      if (checkout.config.isProduction) bridgeInstance = ETH_MAINNET_TO_ZKEVM_MAINNET;

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_TOKEN_BRIDGE,
          tokenBridge: new TokenBridge(new BridgeConfiguration({
            baseConfig: new ImmutableConfiguration(config),
            bridgeInstance,
            rootProvider,
            childProvider,
          })),
        },
      });

      const allowedBridgingNetworks = await checkout.getNetworkAllowList({
        type: NetworkFilterTypes.ALL,
      });

      const toNetwork = allowedBridgingNetworks.networks.find(
        (network) => network.chainId === toChainId,
      );
      if (toNetwork) {
        bridgeDispatch({
          payload: {
            type: BridgeActions.SET_TO_NETWORK,
            toNetwork,
          },
        });
      }

      if (!await loadBalances()) return;

      showBridgeView();
    };

    bridgetWidgetSetup();
  }, [checkout, provider]);

  return (
    <BiomeCombinedProviders theme={{ base: themeReducerValue }}>
      <ViewContext.Provider value={viewReducerValues}>
        <BridgeContext.Provider value={bridgeReducerValues}>
          <CryptoFiatProvider environment={environment}>
            {viewReducerValues.viewState.view.type === SharedViews.LOADING_VIEW && (
              <LoadingView loadingText={loadingText} />
            )}
            {viewReducerValues.viewState.view.type === BridgeWidgetViews.BRIDGE && (
              <Bridge
                amount={viewReducerValues.viewState.view.data?.fromAmount ?? amount}
                fromContractAddress={viewReducerValues.viewState.view.data?.fromContractAddress ?? fromContractAddress}
              />
            )}
            {viewReducerValues.viewState.view.type === BridgeWidgetViews.IN_PROGRESS && (
              <MoveInProgress
                token={viewReducerValues.viewState.view.data.token}
                transactionResponse={viewReducerValues.viewState.view.data.transactionResponse}
                bridgeForm={viewReducerValues.viewState.view.data.bridgeForm}
              />
            )}
            {viewReducerValues.viewState.view.type === BridgeWidgetViews.APPROVE_ERC20 && (
              <ApproveERC20BridgeOnboarding data={viewReducerValues.viewState.view.data} />
            )}
            {viewReducerValues.viewState.view.type === BridgeWidgetViews.SUCCESS && (
              <StatusView
                statusText={successText.text} // todo: move to text
                actionText={successText.actionText}
                onActionClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
                onRenderEvent={() => sendBridgeSuccessEvent(
                  eventTarget,
                  (viewReducerValues.viewState.view as BridgeSuccessView).data.transactionHash,
                )}
                statusType={StatusType.SUCCESS}
                testId="success-view"
              />
            )}
            {viewReducerValues.viewState.view.type === BridgeWidgetViews.FAIL && (
              <StatusView
                statusText={failText.text}
                actionText={failText.actionText}
                onActionClick={() => {
                  if (viewState.view.type === BridgeWidgetViews.FAIL) {
                    viewDispatch({
                      payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                          type: BridgeWidgetViews.BRIDGE,
                          data: viewState.view.data,
                        },
                      },
                    });
                  }
                }}
                onRenderEvent={() => sendBridgeFailedEvent(eventTarget, 'Transaction failed')}
                onCloseClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
                statusType={StatusType.FAILURE}
                testId="fail-view"
              />
            )}
            {viewReducerValues.viewState.view.type === SharedViews.ERROR_VIEW && (
              <ErrorView
                actionText={errorText.actionText}
                onActionClick={async () => {
                  setErrorViewLoading(true);
                  const data = viewState.view as ErrorViewType;

                  if (!data.tryAgain) {
                    showBridgeView();
                    setErrorViewLoading(false);
                    return;
                  }

                  if (await data.tryAgain()) showBridgeView();
                  setErrorViewLoading(false);
                }}
                onCloseClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
                errorEventActionLoading={errorViewLoading}
              />
            )}
          </CryptoFiatProvider>
        </BridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
