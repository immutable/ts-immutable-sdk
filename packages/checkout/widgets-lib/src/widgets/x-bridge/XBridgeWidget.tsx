import {
  BiomeCombinedProviders,
} from '@biom3/react';
import {
  BridgeWidgetParams,
  Checkout,
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
import { XBridgeContext, xBridgeReducer, initialXBridgeState } from './context/XBridgeContext';
import { widgetTheme } from '../../lib/theme';
import { BridgeWalletSelection } from './views/BridgeWalletSelection';
import { BridgeReview } from './views/BridgeReview';

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
    { ...initialViewState, view: { type: XBridgeWidgetViews.BRIDGE_REVIEW } },
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

  return (
    <BiomeCombinedProviders theme={{ base: themeReducerValue }}>
      <ViewContext.Provider value={viewReducerValues}>
        <XBridgeContext.Provider value={bridgeReducerValues}>
          <CryptoFiatProvider environment={environment}>
            {viewState.view.type === XBridgeWidgetViews.BRIDGE_WALLET_SELECTION && (
              <BridgeWalletSelection />
            )}
            {viewState.view.type === XBridgeWidgetViews.BRIDGE_REVIEW && (
              <BridgeReview />
            )}
          </CryptoFiatProvider>
        </XBridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
