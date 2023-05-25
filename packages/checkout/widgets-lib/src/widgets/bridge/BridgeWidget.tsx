/* eslint-disable no-console */
import {
  BiomeCombinedProviders,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  ChainId,
  Checkout,
  ConnectionProviders,
  GetTokenAllowListResult,
  NetworkFilterTypes,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import {
  useEffect, useMemo, useReducer, useRef, useState,
} from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { l1Network, zkEVMNetwork } from '../../lib/networkUtils';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { Network, WidgetTheme } from '../../lib';
import {
  BaseViews,
  ViewActions, ViewContext, initialViewState, viewReducer,
} from '../../context/view-context/ViewContext';
import {
  BridgeActions, BridgeContext, bridgeReducer, initialBridgeState,
} from './context/BridgeContext';
import { LoadingView } from '../../components/Loading/LoadingView';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { Bridge } from './views/Bridge';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';

export interface BridgeWidgetProps {
  params: BridgeWidgetParams;
  config: StrongCheckoutWidgetsConfig
}

export interface BridgeWidgetParams {
  providerPreference: ConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  fromNetwork?: Network;
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
  const { params, config } = props;
  const { environment, theme } = config;

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const firstRender = useRef(true);

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);

  const [bridgeState, bridgeDispatch] = useReducer(bridgeReducer, initialBridgeState);
  const bridgeReducerValues = useMemo(() => ({ bridgeState, bridgeDispatch }), [bridgeState, bridgeDispatch]);

  const {
    providerPreference, amount, fromContractAddress,
  } = params;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const defaultFromChainId = l1Network(environment);
  const toChainId = zkEVMNetwork(environment);

  const [transactionResponse, setTransactionResponse] = useState<
  TransactionResponse | undefined
  >();

  /**
   * This effect is used to set up the BridgeWidget state for the first time.
   * It includes connecting with a provider preference
   * Checking that the provider is connected to an available network and switching
   * to the default specified network
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

      const connectResult = await checkout.connect({
        providerPreference: providerPreference ?? ConnectionProviders.METAMASK,
      });

      // The correct network check should be done by the ConnectionLoader

      // check that the user is on the correct network
      // let theProvider;
      // theProvider = connectResult.provider;

      // const requireNetworkSwitch = defaultFromChainId !== connectResult.network.chainId;

      // if (requireNetworkSwitch) {
      //   let switchNetworkResponse: SwitchNetworkResult;
      //   try {
      //     switchNetworkResponse = await checkout.switchNetwork({
      //       provider: connectResult.provider,
      //       chainId: defaultFromChainId,
      //     });
      //     theProvider = switchNetworkResponse ? switchNetworkResponse.provider : null;
      //   } catch {
      //     console.log('cooked');
      //   }

      //   // connectResult = await checkout.connect({ providerPreference });
      // }

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_PROVIDER,
          provider: connectResult.provider,
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

    if (firstRender.current) {
      bridgetWidgetSetup();
    }
  }, [providerPreference, defaultFromChainId, toChainId, firstRender.current]);

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

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <BridgeContext.Provider value={bridgeReducerValues}>
          {viewReducerValues.viewState.view.type === BaseViews.LOADING_VIEW && (
          <LoadingView loadingText="Loading" />
          )}
          {viewReducerValues.viewState.view.type === BridgeWidgetViews.BRIDGE && (
          <Bridge
            amount={amount}
            fromContractAddress={fromContractAddress}
            setTransactionResponse={setTransactionResponse}
          />
          )}
          {viewReducerValues.viewState.view.type === BridgeWidgetViews.SUCCESS && (
            <StatusView
              statusText={`Success, transaction hash: ${transactionResponse?.hash}`}
              actionText="Continue"
              onActionClick={sendBridgeWidgetCloseEvent}
              statusType={StatusType.SUCCESS}
              testId="success-view"
            />
          )}
        </BridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
