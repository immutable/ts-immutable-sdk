import {
  useCallback, useContext, useEffect, useMemo, useReducer,
} from 'react';

import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { WidgetTheme } from '../../lib';
import { LoadingView } from '../../views/loading/LoadingView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { text } from '../../resources/text/textConfig';
import {
  viewReducer,
  initialViewState,
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../context/view-context/ViewContext';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';

import { PaymentMethods } from './views/PaymentMethods';
import { ReviewOrder } from './views/ReviewOrder';
import { PayWithCard } from './views/PayWithCard';
import { PrimaryRevenueWidgetViews } from '../../context/view-context/PrimaryRevenueViewContextTypes';
import { TopUpView } from '../../views/top-up/TopUpView';

export interface PrimaryRevenueWidgetProps {
  config: StrongCheckoutWidgetsConfig;
}

export function PrimaryRevenueWidget(props: PrimaryRevenueWidgetProps) {
  const { config } = props;
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;

  const { theme } = config;

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const mount = useCallback(async () => {
    if (!checkout || !provider) return;

    try {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: PrimaryRevenueWidgetViews.PAYMENT_METHODS },
        },
      });
    } catch (error: any) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error,
          },
        },
      });
    }
  }, [checkout, provider]);

  // FIXME: Best way to check balances?
  const handleCheckBalances = useCallback(async () => {
    if (!checkout || !provider) return false;

    const walletAddress = await provider.getSigner().getAddress();
    const { formattedBalance } = await checkout.getBalance({
      provider,
      walletAddress,
      // FIXME: get erc20 address from props
      contractAddress: '0x21b51ec6fb7654b7e59e832f9e9687f29df94fb8',
    });

    const balance = Number(formattedBalance);

    // FIXME: get amount from props
    // const amount = 0.0001;
    const amount = 10000000;

    return balance > amount;
  }, [checkout, provider]);

  useEffect(() => {
    if (!checkout || !provider) return;
    mount();
  }, [checkout, provider]);

  const handleGoBack = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: PrimaryRevenueWidgetViews.PAYMENT_METHODS },
      },
    });
  }, []);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        {viewState.view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={loadingText} />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAYMENT_METHODS && (
          <PaymentMethods checkBalances={handleCheckBalances} />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO && (
          <ReviewOrder />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAY_WITH_CARD && (
          <PayWithCard />
        )}
        {viewState.view.type === SharedViews.TOP_UP_VIEW && (
          <TopUpView
            widgetEvent={IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT}
            // FIXME: pass on config to enable/disable options
            showOnrampOption
            showSwapOption
            showBridgeOption
            onCloseButtonClick={handleGoBack}
            onBackButtonClick={handleGoBack}
          />
        )}
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
