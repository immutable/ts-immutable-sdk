import {
  BiomeCombinedProviders,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  Checkout,
  GetTokenAllowListResult,
  NetworkFilterTypes,
  TokenFilterTypes,
  RPC_URL_MAP,
} from '@imtbl/checkout-sdk';
import {
  useEffect, useMemo, useReducer, useRef,
} from 'react';
import {
  BridgeConfiguration, ETH_MAINNET_TO_ZKEVM_MAINNET, ETH_SEPOLIA_TO_ZKEVM_DEVNET, TokenBridge,
} from '@imtbl/bridge-sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';
import {
  l1Network, zkEVMNetwork, WidgetTheme,
} from '../../lib';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  SharedViews,
  ViewActions, ViewContext, initialViewState, viewReducer,
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

export interface BridgeWidgetProps {
  params: BridgeWidgetParams;
  config: StrongCheckoutWidgetsConfig
  web3Provider?: Web3Provider;
}

export interface BridgeWidgetParams {
  fromContractAddress?: string;
  amount?: string;
}

export function BridgeWidget(props: BridgeWidgetProps) {
  const { params, config, web3Provider } = props;
  const { environment, theme } = config;
  const successText = text.views[BridgeWidgetViews.SUCCESS];
  const failText = text.views[BridgeWidgetViews.FAIL];
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;
  const errorText = text.views[SharedViews.ERROR_VIEW];

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const firstRender = useRef(true);

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const [bridgeState, bridgeDispatch] = useReducer(bridgeReducer, initialBridgeState);
  const bridgeReducerValues = useMemo(() => ({ bridgeState, bridgeDispatch }), [bridgeState, bridgeDispatch]);

  const {
    amount, fromContractAddress,
  } = params;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const defaultFromChainId = l1Network(environment);
  const toChainId = zkEVMNetwork(environment);

  useEffect(() => {
    const bridgetWidgetSetup = async () => {
      if (!web3Provider) return;
      const checkout = new Checkout({
        baseConfig: { environment },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_CHECKOUT,
          checkout,
        },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_PROVIDER,
          provider: web3Provider,
        },
      });

      const rootProvider = new ethers.providers.JsonRpcProvider(
        config.environment
            === Environment.PRODUCTION ? RPC_URL_MAP.get(ChainId.ETHEREUM)
          : RPC_URL_MAP.get(ChainId.SEPOLIA),
      );

      const childProvider = new ethers.providers.JsonRpcProvider(
        config.environment
        === Environment.PRODUCTION ? RPC_URL_MAP.get(ChainId.IMTBL_ZKEVM_TESTNET)
          : RPC_URL_MAP.get(ChainId.IMTBL_ZKEVM_DEVNET),
      );

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_TOKEN_BRIDGE,
          tokenBridge: new TokenBridge(new BridgeConfiguration({
            baseConfig: new ImmutableConfiguration(config),
            bridgeInstance: config.environment
              === Environment.PRODUCTION ? ETH_MAINNET_TO_ZKEVM_MAINNET : ETH_SEPOLIA_TO_ZKEVM_DEVNET,
            rootProvider,
            childProvider,
          })),
        },
      });

      const allowedBridgingNetworks = await checkout.getNetworkAllowList({
        type: NetworkFilterTypes.ALL,
      });

      const toNetwork = allowedBridgingNetworks.networks.find((network) => network.chainId === toChainId);

      if (toNetwork) {
        bridgeDispatch({
          payload: {
            type: BridgeActions.SET_TO_NETWORK,
            toNetwork,
          },
        });
      }

      const getNetworkResult = await checkout.getNetworkInfo({ provider: web3Provider });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_NETWORK,
          network: getNetworkResult,
        },
      });

      const address = await web3Provider.getSigner().getAddress();
      const tokenBalances = await checkout.getAllBalances({
        provider: web3Provider,
        walletAddress: address,
        chainId: getNetworkResult.chainId,
      });

      const allowList: GetTokenAllowListResult = await checkout.getTokenAllowList(
        {
          chainId: getNetworkResult.chainId,
          type: TokenFilterTypes.BRIDGE,
        },
      );

      // allow ETH in tokenBalances even if 0 balance so we can check for
      // enough funds for gas
      const allowedTokenBalances = tokenBalances.balances
        .filter((balance) => (balance.balance.gt(0) || (!balance.token.address || balance.token.address === 'NATIVE'))
         && allowList.tokens
           .map((token) => token.address)
           .includes(balance.token.address));

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_ALLOWED_TOKENS,
          allowedTokens: allowList.tokens,
        },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_TOKEN_BALANCES,
          tokenBalances: allowedTokenBalances,
        },
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.BRIDGE },
        },
      });
    };

    if (firstRender.current) {
      bridgetWidgetSetup();
    }
  }, [web3Provider, defaultFromChainId, toChainId, firstRender.current]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <BridgeContext.Provider value={bridgeReducerValues}>
          <CryptoFiatProvider environment={environment}>
            {viewReducerValues.viewState.view.type === SharedViews.LOADING_VIEW && (
              <LoadingView loadingText={loadingText} />
            )}
            {viewReducerValues.viewState.view.type === BridgeWidgetViews.BRIDGE && (
              <Bridge
                amount={viewReducerValues.viewState.view.data?.amount ?? amount}
                fromContractAddress={viewReducerValues.viewState.view.data?.tokenAddress ?? fromContractAddress}
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
                onActionClick={sendBridgeWidgetCloseEvent}
                onRenderEvent={() => sendBridgeSuccessEvent(
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
                onRenderEvent={() => sendBridgeFailedEvent('Transaction failed')}
                onCloseClick={sendBridgeWidgetCloseEvent}
                statusType={StatusType.FAILURE}
                testId="fail-view"
              />
            )}
            {viewReducerValues.viewState.view.type === SharedViews.ERROR_VIEW && (
              <ErrorView
                actionText={errorText.actionText}
                onActionClick={() => {
                  viewDispatch({
                    payload: {
                      type: ViewActions.UPDATE_VIEW,
                      view: { type: BridgeWidgetViews.BRIDGE },
                    },
                  });
                }}
                onCloseClick={sendBridgeWidgetCloseEvent}
              />
            )}
          </CryptoFiatProvider>
        </BridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
