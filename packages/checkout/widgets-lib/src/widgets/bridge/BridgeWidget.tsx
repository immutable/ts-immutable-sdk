/* eslint-disable no-console */
import {
  BiomeCombinedProviders,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  Checkout,
  ConnectionProviders,
  GetTokenAllowListResult,
  NetworkFilterTypes,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import {
  useEffect, useMemo, useReducer, useRef,
} from 'react';
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
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';

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
        type: NetworkFilterTypes.ALL,
      });

      console.log(allowedBridgingNetworks);

      const toNetwork = allowedBridgingNetworks.networks.find((network) => network.chainId === toChainId);

      if (toNetwork) {
        bridgeDispatch({
          payload: {
            type: BridgeActions.SET_TO_NETWORK,
            toNetwork,
          },
        });
      }

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

      const allowedTokenBalances = tokenBalances.balances.filter((balance) => balance.balance.gt(0)
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
  }, [providerPreference, defaultFromChainId, toChainId, firstRender.current]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <BridgeContext.Provider value={bridgeReducerValues}>
          <CryptoFiatProvider>
            {viewReducerValues.viewState.view.type === BaseViews.LOADING_VIEW && (
            <LoadingView loadingText="Loading" />
            )}
            {viewReducerValues.viewState.view.type === BridgeWidgetViews.BRIDGE && (
            <Bridge
              amount={amount}
              fromContractAddress={fromContractAddress}
            />
            )}
            {viewReducerValues.viewState.view.type === BridgeWidgetViews.SUCCESS && (
            <StatusView
              statusText="Success"
              actionText="Continue"
              onActionClick={sendBridgeWidgetCloseEvent}
              statusType={StatusType.SUCCESS}
              testId="success-view"
            />
            )}
          </CryptoFiatProvider>
        </BridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
