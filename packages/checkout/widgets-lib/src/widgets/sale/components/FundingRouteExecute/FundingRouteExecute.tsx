import { Box, Button } from '@biom3/react';
import { FundingStep, FundingStepType } from '@imtbl/checkout-sdk';
import {
  BridgeEventType, ConnectEventType, ConnectionSuccess, IMTBLWidgetEvents, SwapEventType,
} from '@imtbl/checkout-widgets';
import {
  useCallback,
  useContext,
  useEffect, useMemo, useReducer, useRef, useState,
} from 'react';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
} from '../../../../context/connect-loader-context/ConnectLoaderContext';
import {
  EventTargetActions, EventTargetContext, eventTargetReducer, initialEventTargetState,
} from '../../../../context/event-target-context/EventTargetContext';
import { ConnectWidgetViews } from '../../../../context/view-context/ConnectViewContextTypes';
import { ConnectTargetLayer, getL1ChainId, getL2ChainId } from '../../../../lib/networkUtils';
import { LoadingView } from '../../../../views/loading/LoadingView';
import { BridgeWidget, BridgeWidgetParams } from '../../../bridge/BridgeWidget';
import { ConnectWidget } from '../../../connect/ConnectWidget';
import { SwapWidget, SwapWidgetParams } from '../../../swap/SwapWidget';
import { useSaleContext } from '../../context/SaleContextProvider';
import { text as textConfig } from '../../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../../context/view-context/SaleViewContextTypes';

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
  const {
    config, provider, checkout, fromContractAddress: requiredTokenAddress,
  } = useSaleContext();

  const { connectLoaderDispatch } = useContext(ConnectLoaderContext);
  const text = textConfig.views[SaleWidgetViews.FUND_WITH_SMART_CHECKOUT];

  const [swapParams, setSwapParams] = useState<SwapWidgetParams | undefined>(undefined);
  const [bridgeParams, setBridgeParams] = useState<BridgeWidgetParams | undefined>(undefined);

  const [view, setView] = useState<FundingRouteExecuteViews>(FundingRouteExecuteViews.LOADING);
  const nextView = useRef<FundingRouteExecuteViews | false>(false);

  const [eventTargetState, eventTargetDispatch] = useReducer(eventTargetReducer, initialEventTargetState);
  const eventTargetReducerValues = useMemo(() => (
    { eventTargetState, eventTargetDispatch }), [eventTargetState, eventTargetDispatch]);
  const eventTarget = new EventTarget();

  const handleStep = useCallback(async (step: FundingStep) => {
    if (!checkout || !provider) {
      return;
    }
    const network = await checkout.getNetworkInfo({
      provider,
    });

    if (step.type === FundingStepType.BRIDGE) {
      if (network.chainId === getL1ChainId(checkout!.config)) {
        setBridgeParams({
          fromContractAddress: step.fundingItem.token.address,
          amount: step.fundingItem.fundsRequired.formattedAmount,
        });
        setView(FundingRouteExecuteViews.EXECUTE_BRIDGE);
        return;
      }
      nextView.current = FundingRouteExecuteViews.EXECUTE_BRIDGE;

      setView(FundingRouteExecuteViews.SWITCH_NETWORK_ETH);
    }
    if (step.type === FundingStepType.SWAP) {
      if (network.chainId === getL2ChainId(checkout!.config)) {
        setSwapParams({
          amount: step.fundingItem.fundsRequired.formattedAmount,
          fromContractAddress: step.fundingItem.token.address,
          toContractAddress: requiredTokenAddress,
        });
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
    handleStep(fundingRouteStep);
  }, [fundingRouteStep]);

  const handleCustomEvent = (event) => {
    switch (event.detail.type) {
      case BridgeEventType.SUCCESS: {
        // ! Need to clarify behaviour here - wait for user to click or automatically move them on.
        setTimeout(() => {
          onFundingRouteExecuted();
        }, 1000);
        break;
      }
      case BridgeEventType.FAILURE: {
        // const eventData = event.detail.data as BridgeFailed;
        break;
      }
      case BridgeEventType.CLOSE_WIDGET: {
        break;
      }
      case SwapEventType.SUCCESS: {
        // const eventData = event.detail.data as SwapSuccess;
        setTimeout(() => {
          onFundingRouteExecuted();
        }, 1000);
        break;
      }
      case SwapEventType.FAILURE: {
        // const eventData = event.detail.data as SwapFailed;
        break;
      }
      case SwapEventType.REJECTED: {
        // const eventData = event.detail.data as SwapRejected;
        break;
      }
      case SwapEventType.CLOSE_WIDGET: {
        break;
      }
      default:
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
      default:
        // eslint-disable-next-line no-console
        console.log('invalid event');
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
      { view === FundingRouteExecuteViews.LOADING && (
        <LoadingView loadingText={text.loading.checkingBalances} />
      )}
      { view === FundingRouteExecuteViews.EXECUTE_BRIDGE && (
        <BridgeWidget
          params={bridgeParams!}
          config={config}
        />
      )}
      { view === FundingRouteExecuteViews.EXECUTE_SWAP && (
        <SwapWidget
          params={swapParams!}
          config={config}
        />
      )}
      { view === FundingRouteExecuteViews.SWITCH_NETWORK_ETH && (
        <ConnectWidget
          config={config}
          params={{
            targetLayer: ConnectTargetLayer.LAYER1, web3Provider: provider,
          }}
          deepLink={ConnectWidgetViews.SWITCH_NETWORK}
        />
      )}
      { view === FundingRouteExecuteViews.SWITCH_NETWORK_ZKEVM && (
        <ConnectWidget
          config={config}
          params={{
            targetLayer: ConnectTargetLayer.LAYER2, web3Provider: provider,
          }}
          deepLink={ConnectWidgetViews.SWITCH_NETWORK}
        />
      )}

      {/* Below for dev purposes to skip steps if necessary */}
      <Box testId="funding-route-execute">
        { fundingRouteStep?.type }
        {' '}
        -
        {' '}
        { fundingRouteStep?.fundingItem.token.symbol }
        <Button sx={{ mt: 'auto' }} variant="primary" onClick={onFundingRouteExecuted}>
          next
        </Button>
      </Box>
    </EventTargetContext.Provider>
  );
}
