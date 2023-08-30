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

export interface PrimaryRevenueWidgetProps {
  // @deprecated
  fromContractAddress: string;

  config: StrongCheckoutWidgetsConfig;
  amount: string;
  envId: string;
  fromCurrency: string;
  items: {
    id: string;
    name: string;
    price: string;
    qty: number;
    image: string;
  }[];
}

export function PrimaryRevenueWidget(props: PrimaryRevenueWidgetProps) {
  const {
    config, amount, fromContractAddress, fromCurrency, envId, items,
  } = props;

  const { sign, execute } = useSignOrder({
    envId,
    items,
    amount,
    fromContractAddress,
    fromCurrency,
    // deprecated
    fromCollectionAddress: '0xf578b6bB4FA5c7403147C29be864f5e12BF211a0',
    // provide connected wallet
    recipientAddress: '0x81064a5d163559d422fd311dc36c051424620eb9',
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

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

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

  // FIXME: Best way to check balances?
  const handleCheckBalances = useCallback(async () => {
    if (!checkout || !provider) return false;

    const walletAddress = await provider.getSigner().getAddress();
    const { formattedBalance } = await checkout.getBalance({
      provider,
      walletAddress,
      contractAddress: fromContractAddress,
    });

    const balance = parseFloat(formattedBalance);
    const requiredAmounts = parseFloat(amount);

    return balance > requiredAmounts;
  }, [checkout, provider, amount, fromContractAddress]);

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

  useEffect(() => {
    const orchestratedWidgetEvents = [
      IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
      IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
      IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
    ];

    const handleWidgetEvents = ((event: CustomEvent) => {
      event?.stopPropagation();

      // TODO: add error handling
      // FIXME: export a SharedEventType in widgets/types ??? close-widget, success, failure, rejected, ...etc
      if (['close-widget', 'failure', 'rejected'].includes(event.detail.type)) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: PrimaryRevenueWidgetViews.PAYMENT_METHODS,
            },
          },
        });
        return;
      }

      // TODO: handle `success` for all orchestrated widgets
      if (
        orchestratedWidgetEvents.includes(event.type as IMTBLWidgetEvents)
        && event.detail.type === 'success'
      ) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO,
              data: event.detail.data,
            },
          },
        });

        return;
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: event.detail.type, data: event.detail.data },
        },
      });

      console.log('event', event.detail);
    }) as EventListener;

    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
      handleWidgetEvents,
    );

    orchestratedWidgetEvents.forEach((event) => {
      window.addEventListener(event as IMTBLWidgetEvents, handleWidgetEvents);
    });

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
        handleWidgetEvents,
      );
    };
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
          <ReviewOrder execute={execute} sign={sign} />
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
            onCloseButtonClick={handleGoBackToMethods}
            onBackButtonClick={handleGoBackToMethods}
            amount={amount}
            tokenAddress={fromContractAddress}
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
