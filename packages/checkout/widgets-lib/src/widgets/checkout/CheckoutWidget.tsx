import { useEffect, useMemo, useReducer } from 'react';
import {
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
} from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import {
  checkoutReducer,
  initialCheckoutState,
} from './context/CheckoutContext';
import { CheckoutContextProvider } from './context/CheckoutContextProvider';
import { useConnectLoaderState } from '../../context/connect-loader-context/ConnectLoaderContext';
import {
  SharedViews,
  useViewState,
  ViewContextProvider,
} from '../../context/view-context/ViewContext';
import { LoadingView } from '../../views/loading/LoadingView';

export type CheckoutWidgetInputs = {
  params: CheckoutWidgetParams;
  config: CheckoutWidgetConfiguration;
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const { config, params } = props;

  const { t } = useTranslation();
  const [viewState] = useViewState();
  const [{ checkout, provider }] = useConnectLoaderState();

  useEffect(() => {
    // eslint-disable-next-line
    console.log(
      '🐛 ~ config, checkout, params, provider,:',
      config,
      checkout,
      params,
      provider,
    );
  }, []);

  const [checkoutState, checkoutDispatch] = useReducer(
    checkoutReducer,
    initialCheckoutState,
  );
  const checkoutReducerValues = useMemo(
    () => ({
      checkoutState: { ...checkoutState, checkout, provider },
      checkoutDispatch,
    }),
    [checkoutState, checkoutDispatch, checkout, provider],
  );

  return (
    <ViewContextProvider>
      <CheckoutContextProvider values={checkoutReducerValues}>
        {viewState.view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
        )}
      </CheckoutContextProvider>
    </ViewContextProvider>
  );
}
