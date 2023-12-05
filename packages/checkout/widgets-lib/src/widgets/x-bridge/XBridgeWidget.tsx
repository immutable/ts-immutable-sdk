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
import { StatusView } from 'components/Status/StatusView';
import { StatusType } from 'components/Status/StatusType';
import { text } from 'resources/text/textConfig';
import {
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
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
          </CryptoFiatProvider>
        </XBridgeContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
