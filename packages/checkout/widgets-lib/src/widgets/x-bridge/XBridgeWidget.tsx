import {
  BiomeCombinedProviders, Button,
} from '@biom3/react';
import {
  BridgeWidgetParams,
  Checkout,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { useMemo, useReducer } from 'react';
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { CryptoFiatProvider } from 'context/crypto-fiat-context/CryptoFiatProvider';
import { Web3Provider } from '@ethersproject/providers';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import {
  XBridgeContext, xBridgeReducer, initialXBridgeState, BridgeActions,
} from './context/XBridgeContext';
import { widgetTheme } from '../../lib/theme';
import { BridgeWalletSelection } from './views/BridgeWalletSelection';
import { Bridge } from './views/Bridge';

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

  const [viewState, viewDispatch] = useReducer(
    viewReducer,
    // todo: revert back to show BRIDGE_WALLET_SELECTION
    { ...initialViewState, view: { type: XBridgeWidgetViews.BRIDGE_FORM } },
  );
  const [bridgeState, bridgeDispatch] = useReducer(
    xBridgeReducer,
    {
      ...initialXBridgeState,
      checkout,
      web3Provider: web3Provider ?? null,
    },
  );

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
  const bridgeReducerValues = useMemo(() => ({ bridgeState, bridgeDispatch }), [bridgeState, bridgeDispatch]);
  const themeReducerValue = useMemo(() => widgetTheme(theme), [theme]);

  // todo: remove - using to create a provider to get balances from while
  // connection from wallet selection not available
  const connect = async () => {
    if (!checkout) return;
    const providerResult = await checkout.createProvider({ walletProviderName: WalletProviderName.METAMASK });
    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_PROVIDER,
        web3Provider: providerResult.provider,
      },
    });
    await checkout.connect({ provider: providerResult.provider });
    console.log('Temporary provider created - balances will update on interval callback');
  };

  return (
    <BiomeCombinedProviders theme={{ base: themeReducerValue }}>
      <ViewContext.Provider value={viewReducerValues}>
        <XBridgeContext.Provider value={bridgeReducerValues}>
          <CryptoFiatProvider environment={environment}>
            {viewState.view.type === XBridgeWidgetViews.BRIDGE_WALLET_SELECTION && (
              <BridgeWalletSelection />
            )}
            {viewState.view.type === XBridgeWidgetViews.BRIDGE_FORM && (
              <Bridge />
            )}
          </CryptoFiatProvider>
          {/* todo: remove this button thats being used to create a provider */}
          <Button onClick={connect}>Create a provider</Button>
        </XBridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
