import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import {
  CommerceEventType,
  CommerceWidgetParams,
  CommerceFlowType,
  CommerceWidgetConfiguration,
  Checkout,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import {
  useViewState,
  SharedViews,
  ViewContextProvider,
  ViewActions,
} from '../../context/view-context/ViewContext';
import { LoadingView } from '../../views/loading/LoadingView';
import { sendCheckoutEvent } from './CommerceWidgetEvents';
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
import AddTokensWidget from '../add-tokens/AddTokensWidget';
import {
  isConnectLoaderFlow,
  isProvidersContextFlow,
} from './functions/getFlowRequiresContext';
import { useWidgetEvents } from './hooks/useWidgetEvents';
import { getConnectLoaderParams } from './functions/getConnectLoaderParams';
import { commerceFlows } from './functions/isValidCommerceFlow';
import { ProvidersContextProvider } from '../../context/providers-context/ProvidersContext';
import {
  CommerceActions,
  CommerceContext,
  commerceReducer,
  initialCommerceState,
} from './context/CommerceContext';

export type CommerceWidgetInputs = {
  checkout: Checkout;
  browserProvider?: WrappedBrowserProvider;
  flowParams: CommerceWidgetParams;
  flowConfig: CommerceWidgetConfiguration;
  widgetsConfig: StrongCheckoutWidgetsConfig;
};

export default function CommerceWidget(props: CommerceWidgetInputs) {
  const {
    flowParams, flowConfig, widgetsConfig, checkout, browserProvider,
  } = props;

  const { t } = useTranslation();
  const viewState = useViewState();
  const [{ view, history }, viewDispatch] = viewState;
  const [{ eventTarget }] = useEventTargetState();

  const [commerceState, commerceDispatch] = useReducer(
    commerceReducer,
    initialCommerceState,
  );
  const commerceReducerValues = useMemo(
    () => ({ commerceState, commerceDispatch }),
    [commerceState, commerceDispatch],
  );

  const { provider } = commerceState;

  const connectLoaderParams = useMemo(
    () => getConnectLoaderParams(view, checkout, provider || browserProvider),
    [view, checkout, provider, browserProvider],
  );

  const connectLoaderSuccessEvent = flowParams.flow === CommerceFlowType.ADD_TOKENS ? () => {} : undefined;

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

  const handleProviderUpdated = useMemo(
    () => (updatedProvider: WrappedBrowserProvider) => {
      commerceDispatch({
        payload: {
          type: CommerceActions.SET_PROVIDER,
          provider: updatedProvider,
        },
      });
    },
    [commerceDispatch],
  );

  /**
   * Subscribe and Handle widget events
   */
  useWidgetEvents(eventTarget, viewState, handleProviderUpdated);

  useEffect(() => {
    if (!browserProvider) {
      return;
    }
    commerceDispatch({
      payload: {
        type: CommerceActions.SET_PROVIDER,
        provider: browserProvider,
      },
    });
  }, [commerceDispatch, browserProvider]);

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
    if (commerceFlows.includes(flowParams.flow)) return;

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
      <CommerceContext.Provider value={commerceReducerValues}>
        {/* --- Status Views --- */}
        {view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
        )}
        {view.type === SharedViews.ERROR_VIEW && (
          <ErrorView
            onCloseClick={() => {
              sendCheckoutEvent(eventTarget, {
                type: CommerceEventType.CLOSE,
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
        {view.type === CommerceFlowType.CONNECT && (
          <ConnectWidget
            config={widgetsConfig}
            checkout={checkout}
            sendCloseEventOverride={() => {
              sendCheckoutEvent(eventTarget, {
                type: CommerceEventType.CLOSE,
                data: {},
              });
            }}
            {...(view.data.params || {})}
          />
        )}
        {view.type === CommerceFlowType.BRIDGE && (
          <BridgeWidget
            config={widgetsConfig}
            checkout={checkout}
            browserProvider={browserProvider}
            showBackButton={showBackButton}
            {...(view.data.params || {})}
          />
        )}
        {/* --- Widgets that require providers context --- */}
        {shouldWrapWithProvidersContext && view.type === CommerceFlowType.ADD_TOKENS && (
          <ProvidersContextProvider initialState={{ checkout, toProvider: view.data.params.toProvider }}>
            <AddTokensWidget
              config={widgetsConfig}
              {...(view.data.params || {})}
              {...(view.data.config || {})}
              showBackButton={showBackButton}
            />
          </ProvidersContextProvider>
        )}
        {/* --- Widgets that require connect loader --- */}
        {shouldWrapWithConnectLoader && (
          <ConnectLoader
            widgetConfig={widgetsConfig}
            params={connectLoaderParams}
            successEvent={connectLoaderSuccessEvent}
            closeEvent={() => {
              sendCheckoutEvent(eventTarget, {
                type: CommerceEventType.CLOSE,
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
              {view.type === CommerceFlowType.WALLET && (
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
              {view.type === CommerceFlowType.SALE && (
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
              {view.type === CommerceFlowType.SWAP && (
                <SwapWidget
                  config={widgetsConfig}
                  {...(view.data.params || {})}
                  {...(view.data.config || {})}
                  showBackButton={showBackButton}
                />
              )}
              {view.type === CommerceFlowType.ONRAMP && (
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
      </CommerceContext.Provider>
    </ViewContextProvider>
  );
}
