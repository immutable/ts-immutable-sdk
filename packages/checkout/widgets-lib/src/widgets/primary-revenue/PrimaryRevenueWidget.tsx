/* eslint-disable no-console */
import {
  useCallback, useContext, useEffect, useMemo, useReducer,
} from 'react';

import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import {
  IMTBLWidgetEvents,
  OrchestrationEventType,
} from '@imtbl/checkout-widgets';
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
import { BridgeWidget } from '../bridge/BridgeWidget';
import { SwapWidget } from '../swap/SwapWidget';
import { OnRampWidget } from '../on-ramp/OnRampWidget';
import { useSignOrder } from './hooks/useSignOrder';
import { Item } from './hooks/useMergeItemsInfo';

export interface PrimaryRevenueWidgetProps {
  config: StrongCheckoutWidgetsConfig;
  amount: string;
  fromCurrency: string;
  items: Item[];
}

export function PrimaryRevenueWidget(props: PrimaryRevenueWidgetProps) {
  const {
    config, amount, fromCurrency, items,
  } = props;

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const { sign, execute } = useSignOrder({
    items,
    fromCurrency,
    provider,
  });

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

  const mount = useCallback(async () => {
    if (!checkout || !provider) return;

    try {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: PrimaryRevenueWidgetViews.PAYMENT_METHODS,
          },
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

  // TODO: Integrate Smart Checkout to check balances
  const handleCheckBalances = useCallback(async () => {
    if (!checkout || !provider) return false;

    const walletAddress = await provider.getSigner().getAddress();
    const { formattedBalance } = await checkout.getBalance({
      provider,
      walletAddress,
      contractAddress: '',
    });

    const balance = parseFloat(formattedBalance);
    const requiredAmounts = parseFloat(amount);

    return balance > requiredAmounts;
  }, [checkout, provider, amount]);

  useEffect(() => {
    if (!checkout || !provider) return;
    mount();
  }, [checkout, provider]);

  const handleGoBackToMethods = useCallback(() => {
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
          <PaymentMethods checkBalances={handleCheckBalances} sign={sign} />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO && (
          <ReviewOrder
            currency={fromCurrency}
            execute={execute}
            viewState={viewState}
            items={items}
          />
        )}
        {viewState.view.type === PrimaryRevenueWidgetViews.PAY_WITH_CARD && (
          <PayWithCard />
        )}
        {viewState.view.type === SharedViews.TOP_UP_VIEW && (
          <TopUpView
            widgetEvent={IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT}
            showOnrampOption={config.isOnRampEnabled}
            showSwapOption={config.isSwapEnabled}
            showBridgeOption={config.isBridgeEnabled}
            onCloseButtonClick={handleGoBackToMethods}
            onBackButtonClick={handleGoBackToMethods}
            amount={amount}
            tokenAddress=""
          />
        )}
        {viewState.view.type
          === (OrchestrationEventType.REQUEST_ONRAMP as unknown) && (
          <OnRampWidget config={config} params={{ ...viewState.view.data }} />
        )}
        {viewState.view.type
          === (OrchestrationEventType.REQUEST_SWAP as unknown) && (
          <SwapWidget config={config} params={{ ...viewState.view.data }} />
        )}
        {viewState.view.type
          === (OrchestrationEventType.REQUEST_BRIDGE as unknown) && (
          <BridgeWidget config={config} params={{ ...viewState.view.data }} />
        )}
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
