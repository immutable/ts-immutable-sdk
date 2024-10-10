import {
  Suspense, useCallback, useEffect, useMemo,
} from 'react';
import {
  CheckoutEventType,
  CheckoutWidgetParams,
  CheckoutFlowType,
  CheckoutWidgetConfiguration,
  Checkout,
} from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from '@ethersproject/providers';
import { CheckoutWidgetContextProvicer } from './context/CheckoutContextProvider';
import {
  useViewState,
  SharedViews,
  ViewContextProvider,
  ViewActions,
} from '../../context/view-context/ViewContext';
import { LoadingView } from '../../views/loading/LoadingView';
import { sendCheckoutEvent } from './CheckoutWidgetEvents';
import { useEventTargetState } from '../../context/event-target-context/EventTargetContext';
import { ErrorView } from '../../views/error/ErrorView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import SwapWidget from '../swap/SwapWidget';
import { ConnectLoader } from '../../components/ConnectLoader/ConnectLoader';
import ConnectWidget from '../connect/ConnectWidget';
import BridgeWidget from '../bridge/BridgeWidget';
import OnRampWidget from '../on-ramp/OnRampWidget';
import WalletWidget from '../wallet/WalletWidget';
import SaleWidget from '../sale/SaleWidget';
import AddFundsWidget from '../add-funds/AddFundsWidget';
import {
  isConnectLoaderFlow,
  isProvidersContextFlow,
} from './functions/getFlowRequiresContext';
import { useWidgetEvents } from './hooks/useWidgetEvents';
import { getConnectLoaderParams } from './functions/getConnectLoaderParams';
import { checkoutFlows } from './functions/isValidCheckoutFlow';
import { ProvidersContextProvider } from '../../context/providers-context/ProvidersContext';

export type CheckoutWidgetInputs = {
  checkout: Checkout;
  web3Provider?: Web3Provider;
  flowParams: CheckoutWidgetParams;
  flowConfig: CheckoutWidgetConfiguration;
  widgetsConfig: StrongCheckoutWidgetsConfig;
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const {
    flowParams, flowConfig, widgetsConfig, checkout, web3Provider,
  } = props;

  const { t } = useTranslation();
  const viewState = useViewState();
  const [{ view, history }, viewDispatch] = viewState;
  const [{ eventTarget }] = useEventTargetState();

  const connectLoaderParams = useMemo(
    () => getConnectLoaderParams(view, checkout, web3Provider),
    [view, checkout, web3Provider],
  );

  const goToPreviousView = useCallback(() => {
    const sharedViews = [
      SharedViews.LOADING_VIEW,
      SharedViews.ERROR_VIEW,
      SharedViews.SUCCESS_VIEW,
      SharedViews.TOP_UP_VIEW,
      SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
    ] as string[];

    const views = history
      .slice(0, -1)
      .filter(({ type }) => !sharedViews.includes(type));
    const lastView = views[views.length - 1];

    if (lastView) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: lastView,
        },
      });
    }
  }, [history]);

  /**
   * Subscribe and Handle widget events
   */
  useWidgetEvents(eventTarget, viewState);

  /**
   * Mount the view according to set flow in params
   */
  useEffect(() => {
    if (!flowParams.flow) return;

    const { flow, ...mountedWidgetParams } = flowParams;

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: flow as any,
          data: {
            params: mountedWidgetParams,
            config: { ...(flowConfig?.[flow] || {}) },
          },
        },
      },
    });
  }, [flowParams]);

  /**
   * If invalid flow set error view
   */
  useEffect(() => {
    if (checkoutFlows.includes(flowParams.flow)) return;

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SharedViews.ERROR_VIEW,
          error: {
            name: 'InvalidViewType',
            message: `Invalid view type "${flowParams.flow}"`,
          },
        },
      },
    });
  }, [flowParams.flow]);

  /**
   * Validate if the view requires connect loader
   */
  const shouldWrapWithConnectLoader = useMemo(
    () => isConnectLoaderFlow(view.type),
    [view.type],
  );

  /**
   * Validate if the view requires providers context
   */
  const shouldWrapWithProvidersContext = useMemo(
    () => isProvidersContextFlow(view.type),
    [view.type],
  );

  /*
   * Show back button
   */
  const showBackButton = !!view.data?.showBackButton;

  return (
    <ViewContextProvider>
      <CheckoutWidgetContextProvicer>
        {/* --- Status Views --- */}
        {view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
        )}
        {view.type === SharedViews.ERROR_VIEW && (
          <ErrorView
            onCloseClick={() => {
              sendCheckoutEvent(eventTarget, {
                type: CheckoutEventType.CLOSE,
                data: {},
              });
            }}
            onActionClick={() => {
              // TODO: trigger a retry
            }}
            actionText={t('views.ERROR_VIEW.actionText')}
          />
        )}
        {/* --- Widgets without connect loader or providers context --- */}
        {view.type === CheckoutFlowType.CONNECT && (
          <ConnectWidget
            config={widgetsConfig}
            checkout={checkout}
            sendCloseEventOverride={() => {
              sendCheckoutEvent(eventTarget, {
                type: CheckoutEventType.CLOSE,
                data: {},
              });
            }}
            {...(view.data.params || {})}
          />
        )}
        {view.type === CheckoutFlowType.BRIDGE && (
          <BridgeWidget
            config={widgetsConfig}
            checkout={checkout}
            web3Provider={web3Provider}
            showBackButton={showBackButton}
            {...(view.data.params || {})}
          />
        )}
        {/* --- Widgets that require providers context --- */}
        {shouldWrapWithProvidersContext && (
          <ProvidersContextProvider initialState={{ checkout }}>
            {view.type === CheckoutFlowType.ADD_FUNDS && (
              <AddFundsWidget
                config={widgetsConfig}
                {...(view.data.params || {})}
                {...(view.data.config || {})}
                showBackButton={showBackButton}
              />
            )}
          </ProvidersContextProvider>
        )}
        {/* --- Widgets that require connect loader --- */}
        {shouldWrapWithConnectLoader && (
          <ConnectLoader
            widgetConfig={widgetsConfig}
            params={connectLoaderParams}
            closeEvent={() => {
              sendCheckoutEvent(eventTarget, {
                type: CheckoutEventType.CLOSE,
                data: {},
              });
            }}
            showBackButton={showBackButton}
            goBackEvent={goToPreviousView}
          >
            <Suspense
              fallback={
                <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
              }
            >
              {view.type === CheckoutFlowType.WALLET && (
                <WalletWidget
                  config={widgetsConfig}
                  walletConfig={{
                    showNetworkMenu: true,
                    showDisconnectButton: true,
                    ...view.data.config,
                  }}
                  {...(view.data.params || {})}
                />
              )}
              {view.type === CheckoutFlowType.SALE && (
                <SaleWidget
                  config={widgetsConfig}
                  {...(view.data.params || {})}
                  {...{
                    hideExcludedPaymentTypes: false,
                    waitFulfillmentSettlements: true,
                    ...view.data.config,
                  }}
                />
              )}
              {view.type === CheckoutFlowType.SWAP && (
                <SwapWidget
                  config={widgetsConfig}
                  {...(view.data.params || {})}
                  {...(view.data.config || {})}
                  showBackButton={showBackButton}
                />
              )}
              {view.type === CheckoutFlowType.ONRAMP && (
                <OnRampWidget
                  config={widgetsConfig}
                  {...(view.data.params || {})}
                  {...(view.data.config || {})}
                  showBackButton={showBackButton}
                />
              )}
            </Suspense>
          </ConnectLoader>
        )}
      </CheckoutWidgetContextProvicer>
    </ViewContextProvider>
  );
}
