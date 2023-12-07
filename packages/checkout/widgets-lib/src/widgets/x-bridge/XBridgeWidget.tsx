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
import { Web3Provider } from '@ethersproject/providers';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { StatusView } from 'components/Status/StatusView';
import { StatusType } from 'components/Status/StatusType';
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
  const { environment } = config;
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
    },
  );

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
  const bridgeReducerValues = useMemo(() => ({ bridgeState, bridgeDispatch }), [bridgeState, bridgeDispatch]);

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
  );
}
