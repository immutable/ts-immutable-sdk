/* eslint-disable @typescript-eslint/no-unused-vars */
import { CheckoutWidgetParams } from '@imtbl/checkout-sdk';
import {
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  initialViewState,
  SharedViews,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { ErrorView } from '../../views/error/ErrorView';
import { LoadingView } from '../../views/loading/LoadingView';

export type CheckoutWidgetInputs = CheckoutWidgetParams & {
  config: StrongCheckoutWidgetsConfig,
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const { t } = useTranslation();
  const errorActionText = t('views.ERROR_VIEW.actionText');
  const loadingText = t('views.LOADING_VIEW.text');
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const {
    config: {
      environment,
      isOnRampEnabled,
      isSwapEnabled,
      isBridgeEnabled,
      theme,
    },
  } = props;

  const {
    connectLoaderState: { checkout, provider },
  } = useContext(ConnectLoaderContext);
  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    history: [],
  });

  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  useEffect(() => {
    if (!checkout || !provider) return;
    // eslint-disable-next-line no-console
    console.log('@@@ CheckoutWidget checkout provider', checkout, provider);
  }, [checkout, provider]);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      <CryptoFiatProvider environment={environment}>
        {/* <WalletContext.Provider value={walletReducerValues}> */}
        {viewState.view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={loadingText} />
        )}
        {viewState.view.type === SharedViews.ERROR_VIEW && (
          <ErrorView
            actionText={errorActionText}
            onActionClick={() => { }}
            onCloseClick={() => { }}
          />
        )}
        {/* </WalletContext.Provider> */}
      </CryptoFiatProvider>
    </ViewContext.Provider>
  );
}
