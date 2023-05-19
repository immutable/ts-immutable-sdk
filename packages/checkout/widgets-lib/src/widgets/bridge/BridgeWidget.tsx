/* eslint-disable no-console */
import {
  BiomeCombinedProviders,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import { Network, WidgetTheme } from '@imtbl/checkout-widgets';
import {
  ChainId,
  Checkout,
  ConnectionProviders,
  GetTokenAllowListResult,
  NetworkFilterTypes,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import {
  useEffect, useMemo, useReducer,
} from 'react';
import { Environment } from '@imtbl/config';
import { L1Network, zkEVMNetwork } from '../../lib/networkUtils';
import {
  BaseViews,
  ViewActions, ViewContext, initialViewState, viewReducer,
} from '../../context/view-context/ViewContext';
import { Bridge } from './views/Bridge';
import {
  BridgeActions, BridgeContext, bridgeReducer, initialBridgeState,
} from './context/BridgeContext';
import { LoadingView } from '../../components/Loading/LoadingView';
import { SuccessView } from '../../components/Success/SuccessView';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';

export interface BridgeWidgetProps {
  params: BridgeWidgetParams;
  theme: WidgetTheme;
  environment: Environment;
}

export interface BridgeWidgetParams {
  providerPreference: ConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  fromNetwork?: Network;
}

export enum BridgeWidgetViews {
  BRIDGE = 'BRIDGE',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

// const bridgingNetworks = Object.values(Network);

// TODO: consider changing this to an enum for better discoverability
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NetworkChainMap = {
  [Network.ETHEREUM]: ChainId.ETHEREUM,
  [Network.IMTBL_ZKEVM_TESTNET]: ChainId.IMTBL_ZKEVM_TESTNET,
  [Network.IMTBL_ZKEVM_DEVNET]: ChainId.IMTBL_ZKEVM_DEVNET,
  [Network.POLYGON_ZKEVM_TESTNET]: ChainId.POLYGON_ZKEVM_TESTNET,
  [Network.POLYGON_ZKEVM]: ChainId.POLYGON_ZKEVM,
  [Network.SEPOLIA]: ChainId.SEPOLIA,
};

export function BridgeWidget(props: BridgeWidgetProps) {
  const { environment, params, theme } = props;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const [bridgeState, bridgeDispatch] = useReducer(bridgeReducer, initialBridgeState);
  const bridgeReducerValues = useMemo(() => ({ bridgeState, bridgeDispatch }), [bridgeState, bridgeDispatch]);

  const {
    providerPreference, amount, fromContractAddress,
  } = params;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const defaultFromChainId = L1Network(environment);
  const toChainId = zkEVMNetwork(environment);

  /**
   * This effect is used to set up the BridgeWidget state for the first time.
   * It includes connecting with a provider preference
   * Checking that the provider is connected to an available network and switching
   * to the default specified network if not (if no default provided then Ethereum)
   * It then calculates the toNetwork for the bridge and it's associated native currency.
   *
   * NOTE: This effect should only run on the first render of the component to avoid switchNetwork errors
   */
  useEffect(() => {
    const bridgetWidgetSetup = async () => {
      if (!providerPreference) return;

      const checkout = new Checkout({
        baseConfig: { environment },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_CHECKOUT,
          checkout,
        },
      });

      let connectResult = await checkout.connect({
        providerPreference: providerPreference ?? ConnectionProviders.METAMASK,
      });

      // check that the user is on the correct network
      let theProvider;
      theProvider = connectResult.provider;

      const requireNetworkSwitch = defaultFromChainId !== connectResult.network.chainId;

      if (requireNetworkSwitch) {
        const switchNetworkResponse = await checkout.switchNetwork({
          provider: connectResult.provider,
          chainId: defaultFromChainId,
        });
        connectResult = await checkout.connect({ providerPreference });
        theProvider = switchNetworkResponse.provider;
      }

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_PROVIDER,
          provider: theProvider,
        },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_NETWORK,
          network: connectResult.network,
        },
      });

      const allowedBridgingNetworks = await checkout.getNetworkAllowList({
        type: NetworkFilterTypes.ALL, // TODO: change to Bridge
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

      /**
       * Below setup assumes that we are on the correct network
       */

      const address = await connectResult.provider.getSigner().getAddress();
      const tokenBalances = await checkout.getAllBalances({
        provider: connectResult.provider,
        walletAddress: address,
        chainId: connectResult.network.chainId,
      });

      const allowList: GetTokenAllowListResult = await checkout.getTokenAllowList(
        {
          chainId: connectResult.network.chainId,
          type: TokenFilterTypes.BRIDGE,
        },
      );

      const allowedTokenBalances = tokenBalances.balances.filter((balance) => allowList.tokens
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

    bridgetWidgetSetup();
  }, [providerPreference, defaultFromChainId, toChainId]);

  /**
   * This effect is used to refresh all user balances when the network changes.
   * It also filters out any 0 balances as the user will have nothing to bridge.
   */
  // useEffect(() => {
  //   const refreshBalances = async () => {
  //     if (checkout && provider) {
  //       const getAllBalancesResult = await getAllBalances(checkout, provider);

  //       const nonZeroBalances = getAllBalancesResult.balances
  //         .filter((balance) => balance.balance.gt(0))
  //         .sort((a, b) => b.token.symbol.localeCompare(a.token.symbol));

  //       bridgeDispatch({
  //         payload: {
  //           type: BridgeActions.SET_TOKEN_BALANCES,
  //           tokenBalances: nonZeroBalances,
  //         },
  //       });
  //     }
  //   };
  //   refreshBalances();
  // }, [checkout, provider]);

  // const renderSuccess = () => (
  //   <>
  //     <Body testId="bridge-success">Success</Body>
  //     <EtherscanLink hash={transactionResponse?.hash || ''} />
  //   </>
  // );

  // const renderFailure = () => <Body testId="bridge-failure">Failure</Body>;

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <BridgeContext.Provider value={bridgeReducerValues}>
          {viewReducerValues.viewState.view.type === BaseViews.LOADING_VIEW && (
          <LoadingView loadingText="Loading" />
          )}
          {viewReducerValues.viewState.view.type === BridgeWidgetViews.BRIDGE && (
          <Bridge amount={amount} fromContractAddress={fromContractAddress} />
          )}
          {viewReducerValues.viewState.view.type === BridgeWidgetViews.SUCCESS && (
          <SuccessView
            successText="Success"
            actionText="Continue"
            onActionClick={sendBridgeWidgetCloseEvent}
          />
          )}
        </BridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
