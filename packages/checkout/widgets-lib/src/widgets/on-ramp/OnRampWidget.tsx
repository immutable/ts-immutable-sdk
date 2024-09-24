import { useContext, useMemo, useReducer } from 'react';
import {
  Checkout,
  IMTBLWidgetEvents,
  OnRampWidgetParams,
} from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from '@ethersproject/providers';
import { UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { NATIVE } from '../../lib';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  SharedViews,
  ViewActions,
  ViewContext,
  initialViewState,
  viewReducer,
} from '../../context/view-context/ViewContext';
import {
  OnRampFailView,
  OnRampSuccessView,
  OnRampWidgetViews,
} from '../../context/view-context/OnRampViewContextTypes';
import { LoadingView } from '../../views/loading/LoadingView';
import { TopUpView } from '../../views/top-up/TopUpView';
import {
  sendOnRampFailedEvent,
  sendOnRampSuccessEvent,
  sendOnRampWidgetCloseEvent,
} from './OnRampWidgetEvents';
import { OnRampMain } from './views/OnRampMain';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { OrderInProgress } from './views/OrderInProgress';

export type OnRampWidgetInputs = OnRampWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
  checkout: Checkout;
  web3Provider?: Web3Provider;
};

export default function OnRampWidget({
  amount,
  tokenAddress,
  config,
  showBackButton,
  checkout,
  web3Provider,
  toWalletAddress,
}: OnRampWidgetInputs) {
  const { isOnRampEnabled, isSwapEnabled, isBridgeEnabled } = config;
  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    history: [],
  });
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewReducer],
  );

  const tknAddr = useMemo(
    () => (tokenAddress?.toLocaleLowerCase() === NATIVE ? NATIVE : tokenAddress),
    [tokenAddress],
  );

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const { t } = useTranslation();

  const showIframe = useMemo(
    () => viewState.view.type === OnRampWidgetViews.ONRAMP,
    [viewState.view.type],
  );

  return (
    <ViewContext.Provider value={viewReducerValues}>
      {viewState.view.type === SharedViews.LOADING_VIEW && (
        <LoadingView loadingText={t('views.ONRAMP.initialLoadingText')} />
      )}
      {viewState.view.type === OnRampWidgetViews.IN_PROGRESS_LOADING && (
        <LoadingView
          loadingText={t('views.ONRAMP.IN_PROGRESS_LOADING.loading.text')}
        />
      )}
      {viewState.view.type === OnRampWidgetViews.IN_PROGRESS && (
        <OrderInProgress />
      )}

      {viewState.view.type === OnRampWidgetViews.SUCCESS && (
        <StatusView
          statusText={t('views.ONRAMP.SUCCESS.text')}
          actionText={t('views.ONRAMP.SUCCESS.actionText')}
          onRenderEvent={() => sendOnRampSuccessEvent(
            eventTarget,
            (viewState.view as OnRampSuccessView).data.transactionHash,
          )}
          onActionClick={() => sendOnRampWidgetCloseEvent(eventTarget)}
          statusType={StatusType.SUCCESS}
          testId="success-view"
        />
      )}

      {viewState.view.type === OnRampWidgetViews.FAIL && (
        <StatusView
          statusText={t('views.ONRAMP.FAIL.text')}
          actionText={t('views.ONRAMP.FAIL.actionText')}
          onRenderEvent={() => sendOnRampFailedEvent(
            eventTarget,
            (viewState.view as OnRampFailView).reason ?? 'Transaction failed',
          )}
          onActionClick={() => {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: OnRampWidgetViews.ONRAMP,
                  data: viewState.view.data,
                },
              },
            });
          }}
          statusType={StatusType.FAILURE}
          onCloseClick={() => sendOnRampWidgetCloseEvent(eventTarget)}
          testId="fail-view"
        />
      )}

      {/* This keeps Transak's iframe instance in dom to listen to transak's events. */}
      {/* We will remove the iframe instance once the processing has been finalised, either as a success or a failure */}
      {viewState.view.type !== OnRampWidgetViews.SUCCESS
        && viewState.view.type !== OnRampWidgetViews.FAIL && (
          <OnRampMain
            passport={checkout?.passport}
            showIframe={showIframe}
            tokenAmount={amount ?? viewState.view.data?.amount}
            tokenAddress={tknAddr ?? viewState.view.data?.tokenAddress}
            toWalletAddress={toWalletAddress}
            showBackButton={showBackButton}
            checkout={checkout}
            provider={web3Provider}
          />
      )}

      {viewState.view.type === SharedViews.TOP_UP_VIEW && (
        <TopUpView
          analytics={{ userJourney: UserJourney.ON_RAMP }}
          widgetEvent={IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT}
          checkout={checkout}
          showOnrampOption={isOnRampEnabled}
          showSwapOption={isSwapEnabled}
          showBridgeOption={isBridgeEnabled}
          onCloseButtonClick={() => sendOnRampWidgetCloseEvent(eventTarget)}
        />
      )}
    </ViewContext.Provider>
  );
}
