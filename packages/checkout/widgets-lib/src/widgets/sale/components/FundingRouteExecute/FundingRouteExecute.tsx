import {
  FundingStep,
  FundingStepType,
  BridgeEventType,
  BridgeFailed,
  BridgeTransactionSent,
  BridgeWidgetParams,
  ConnectEventType,
  ConnectionSuccess,
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  SwapEventType,
  SwapFailed,
  SwapSuccess,
  SwapWidgetParams,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect, useMemo, useReducer, useRef, useState,
} from 'react';
import BridgeWidget from 'widgets/bridge/BridgeWidget';
import { useTranslation } from 'react-i18next';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
} from '../../../../context/connect-loader-context/ConnectLoaderContext';
import {
  EventTargetActions, EventTargetContext, eventTargetReducer, initialEventTargetState,
} from '../../../../context/event-target-context/EventTargetContext';
import { ConnectWidgetViews } from '../../../../context/view-context/ConnectViewContextTypes';
import { SaleWidgetViews } from '../../../../context/view-context/SaleViewContextTypes';
import { ViewActions, ViewContext } from '../../../../context/view-context/ViewContext';
import { getL1ChainId, getL2ChainId } from '../../../../lib/networkUtils';
import { LoadingView } from '../../../../views/loading/LoadingView';
import ConnectWidget from '../../../connect/ConnectWidget';
import SwapWidget from '../../../swap/SwapWidget';
import { useSaleContext } from '../../context/SaleContextProvider';
import { SaleErrorTypes } from '../../types';

type FundingRouteExecuteProps = {
  fundingRouteStep?: FundingStep;
  onFundingRouteExecuted: () => void;
};

enum FundingRouteExecuteViews {
  LOADING = 'LOADING',
  EXECUTE_BRIDGE = 'EXECUTE_BRIDGE',
  EXECUTE_SWAP = 'EXECUTE_SWAP',
  SWITCH_NETWORK_ETH = 'SWITCH_NETWORK_ETH',
  SWITCH_NETWORK_ZKEVM = 'SWITCH_NETWORK_ZKEVM',
}

export function FundingRouteExecute({ fundingRouteStep, onFundingRouteExecuted }: FundingRouteExecuteProps) {
  const { t } = useTranslation();
  const {
    config, provider, checkout, fromTokenAddress: requiredTokenAddress,
  } = useSaleContext();
  const { viewDispatch } = useContext(ViewContext);

  const { connectLoaderDispatch } = useContext(ConnectLoaderContext);

  const [swapParams, setSwapParams] = useState<SwapWidgetParams | undefined>(undefined);
  const [bridgeParams, setBridgeParams] = useState<BridgeWidgetParams | undefined>(undefined);

  const [view, setView] = useState<FundingRouteExecuteViews>(FundingRouteExecuteViews.LOADING);
  const nextView = useRef<FundingRouteExecuteViews | false>(false);

  const stepSuccess = useRef<BridgeTransactionSent | SwapSuccess | undefined>(undefined);
  const stepFailed = useRef<BridgeFailed | SwapFailed | undefined>(undefined);

  const [eventTargetState, eventTargetDispatch] = useReducer(eventTargetReducer, initialEventTargetState);
  const eventTargetReducerValues = useMemo(() => (
    { eventTargetState, eventTargetDispatch }), [eventTargetState, eventTargetDispatch]);
  const eventTarget = new EventTarget();

  const sendFailEvent = (errorData?: any) => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.SALE_FAIL,
          data: {
            errorType: SaleErrorTypes.SMART_CHECKOUT_EXECUTE_ERROR,
            errorData,
          },
        },
      },
    });
  };

  const handleStep = useCallback(async (step: FundingStep) => {
    if (!checkout || !provider) {
      throw new Error('checkout or provider not available.');
    }

    const network = await checkout.getNetworkInfo({
      provider,
    });

    if (step.type === FundingStepType.BRIDGE) {
      setBridgeParams({
        tokenAddress: step.fundingItem.token.address,
        amount: step.fundingItem.fundsRequired.formattedAmount,
      });
      if (network.chainId === getL1ChainId(checkout!.config)) {
        setView(FundingRouteExecuteViews.EXECUTE_BRIDGE);
        return;
      }
      nextView.current = FundingRouteExecuteViews.EXECUTE_BRIDGE;

      setView(FundingRouteExecuteViews.SWITCH_NETWORK_ETH);
    }
    if (step.type === FundingStepType.SWAP) {
      setSwapParams({
        amount: step.fundingItem.fundsRequired.formattedAmount,
        fromTokenAddress: step.fundingItem.token.address,
        toTokenAddress: requiredTokenAddress,
      });
      if (network.chainId === getL2ChainId(checkout!.config)) {
        setView(FundingRouteExecuteViews.EXECUTE_SWAP);
        return;
      }
      nextView.current = FundingRouteExecuteViews.EXECUTE_SWAP;

      setView(FundingRouteExecuteViews.SWITCH_NETWORK_ZKEVM);
    }
  }, [provider, checkout]);

  useEffect(() => {
    if (!fundingRouteStep) {
      return;
    }
    try {
      handleStep(fundingRouteStep);
    } catch (err) {
      sendFailEvent(err);
    }
  }, [fundingRouteStep]);

  const onCloseWidget = () => {
    // Need to check SUCCESS first, as it's possible for widget to emit both FAILED and SUCCESS.
    if (stepSuccess.current) {
      stepSuccess.current = undefined;
      stepFailed.current = undefined;
      onFundingRouteExecuted();
    } else {
      sendFailEvent(stepFailed.current);
    }
  };

  const handleCustomEvent = (event) => {
    switch (event.detail.type) {
      case BridgeEventType.TRANSACTION_SENT:
      case SwapEventType.SUCCESS: {
        const successEvent = event.detail.data as (SwapSuccess | BridgeTransactionSent);
        stepSuccess.current = successEvent;
        break;
      }
      case BridgeEventType.FAILURE:
      case SwapEventType.FAILURE: {
        // On FAILURE, widget will prompt user to try again.
        // We need to know if it failed though when they close the widget
        const failureEvent = event.detail.data as (SwapFailed | BridgeFailed);
        stepFailed.current = failureEvent;
        break;
      }
      case BridgeEventType.CLOSE_WIDGET:
      case SwapEventType.CLOSE_WIDGET: {
        onCloseWidget();
        break;
      }
      case SwapEventType.REJECTED:
      default:
        // Widgets internally handle all other than SUCCESS | FAILURE | CLOSE_WIDGET
        break;
    }
  };

  const handleConnectEvent = (event) => {
    switch (event.detail.type) {
      case ConnectEventType.SUCCESS: {
        const eventData = event.detail.data as ConnectionSuccess;
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: eventData.provider,
          },
        });
        if (nextView.current !== false) {
          setView(nextView.current);
          nextView.current = false;
        }
        break;
      }
      case ConnectEventType.FAILURE:
      case ConnectEventType.CLOSE_WIDGET:
      default:
        onCloseWidget();
        break;
    }
  };

  useEffect(() => {
    // Handle the connect event when switching networks
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);

    // Handle the other widget events
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, handleCustomEvent);

    // Remove the custom event listener when the component unmounts
    return () => {
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    eventTargetDispatch({
      payload: {
        type: EventTargetActions.SET_EVENT_TARGET,
        eventTarget,
      },
    });
  }, [checkout]);

  return (
    <EventTargetContext.Provider value={eventTargetReducerValues}>
      {view === FundingRouteExecuteViews.LOADING && (
        <LoadingView loadingText={t('views.FUND_WITH_SMART_CHECKOUT.loading.checkingBalances')} />
      )}
      {view === FundingRouteExecuteViews.EXECUTE_BRIDGE && (
        <BridgeWidget
          {...bridgeParams!}
          config={config}
          checkout={checkout!}
        />
      )}
      {view === FundingRouteExecuteViews.EXECUTE_SWAP && (
        <SwapWidget
          {...swapParams!}
          config={config}
        />
      )}
      {view === FundingRouteExecuteViews.SWITCH_NETWORK_ETH && (
        <ConnectWidget
          config={config}
          targetLayer={ConnectTargetLayer.LAYER1}
          web3Provider={provider}
          checkout={checkout!}
          deepLink={ConnectWidgetViews.SWITCH_NETWORK}
        />
      )}
      {view === FundingRouteExecuteViews.SWITCH_NETWORK_ZKEVM && (
        <ConnectWidget
          config={config}
          targetLayer={ConnectTargetLayer.LAYER2}
          web3Provider={provider}
          checkout={checkout!}
          deepLink={ConnectWidgetViews.SWITCH_NETWORK}
        />
      )}
    </EventTargetContext.Provider>
  );
}
