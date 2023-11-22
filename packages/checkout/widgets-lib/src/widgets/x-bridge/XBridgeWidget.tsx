import {
  BiomeCombinedProviders,
} from '@biom3/react';
import {
  BridgeWidgetParams,
  Checkout,
  NetworkFilterTypes, TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect, useMemo, useReducer,
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
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { CryptoFiatProvider } from 'context/crypto-fiat-context/CryptoFiatProvider';
import { Web3Provider } from '@ethersproject/providers';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  DEFAULT_BALANCE_RETRY_POLICY,
  getL1ChainId,
  getL2ChainId,
} from '../../lib';
import {
  SharedViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import {
  BridgeActions, XBridgeContext, xBridgeReducer, initialXBridgeState,
} from './context/XBridgeContext';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { GetAllowedBalancesResultType, getAllowedBalances } from '../../lib/balance';
import { widgetTheme } from '../../lib/theme';
import { isPassportProvider } from '../../lib/providerUtils';
import { BridgeComingSoon } from './views/BridgeComingSoon';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';
import { CrossWalletSelection } from './views/CrossWalletSelection';

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
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const [viewState, viewDispatch] = useReducer(
    viewReducer,
    { ...initialViewState, view: { type: XBridgeWidgetViews.CROSS_WALLET_SELECTION } },
  );

  const [bridgeState, bridgeDispatch] = useReducer(xBridgeReducer, { ...initialXBridgeState, checkout });

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
  const bridgeReducerValues = useMemo(() => ({ bridgeState, bridgeDispatch }), [bridgeState, bridgeDispatch]);
  const themeReducerValue = useMemo(() => widgetTheme(theme), [theme]);

  // Passport currently does not have an L1 representation and therefore there
  // is not need to show the bridge widget for Passport connected users.
  if (isPassportProvider(web3Provider)) {
    return <BridgeComingSoon onCloseEvent={() => sendBridgeWidgetCloseEvent(eventTarget)} />;
  }

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
    if (!web3Provider) throw new Error('loadBalances: missing provider');

    let tokensAndBalances: GetAllowedBalancesResultType = {
      allowList: { tokens: [] },
      allowedBalances: [],
    };
    try {
      tokensAndBalances = await getAllowedBalances({
        checkout,
        provider: web3Provider,
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
      if (!checkout || !web3Provider) return;

      const getNetworkResult = await checkout.getNetworkInfo({ provider: web3Provider });

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
  }, [checkout, web3Provider]);

  return (
    <BiomeCombinedProviders theme={{ base: themeReducerValue }}>
      <ViewContext.Provider value={viewReducerValues}>
        <XBridgeContext.Provider value={bridgeReducerValues}>
          <CryptoFiatProvider environment={environment}>
            {viewState.view.type === XBridgeWidgetViews.CROSS_WALLET_SELECTION && (
              <CrossWalletSelection />
            )}
          </CryptoFiatProvider>
        </XBridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
