/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Box } from '@biom3/react';
import { FundingStep, FundingStepType } from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect, useMemo, useReducer, useRef, useState,
} from 'react';
import {
  BridgeEventType, ConnectEventType, ConnectionSuccess, IMTBLWidgetEvents, SwapEventType,
} from '@imtbl/checkout-widgets';
import { useSaleContext } from '../../context/SaleContextProvider';
import {
  EventTargetActions, EventTargetContext, eventTargetReducer, initialEventTargetState,
} from '../../../../context/event-target-context/EventTargetContext';
import {
  View, ViewActions, initialViewState, viewReducer,
} from '../../../../context/view-context/ViewContext';
import { LoadingView } from '../../../../views/loading/LoadingView';
import { ConnectTargetLayer, getL1ChainId, getL2ChainId } from '../../../../lib/networkUtils';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
} from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { ConnectWidgetViews } from '../../../../context/view-context/ConnectViewContextTypes';
import { ConnectWidget } from '../../../connect/ConnectWidget';
import { BridgeWidgetParams, BridgeWidget } from '../../../bridge/BridgeWidget';
import { SwapWidgetParams, SwapWidget } from '../../../swap/SwapWidget';
import { FundWithSmartCheckoutSubViews, SaleWidgetViews } from '../../../../context/view-context/SaleViewContextTypes';

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
  const { config, provider, checkout } = useSaleContext();

  const { connectLoaderDispatch } = useContext(ConnectLoaderContext);

  const bridgeParams: BridgeWidgetParams = {
    amount: '1',
    fromContractAddress: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a',
  };

  const swapParams: SwapWidgetParams = {
    amount: '100',
    fromContractAddress: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
    toContractAddress: '0x12739A8f1A8035F439092D016DAE19A2874F30d2',

  };

  const [view, setView] = useState<FundingRouteExecuteViews>(FundingRouteExecuteViews.LOADING);
  console.log('@@@@ FundingRouteExecute', view, fundingRouteStep);
  const nextView = useRef<FundingRouteExecuteViews | false>(false);

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const [eventTargetState, eventTargetDispatch] = useReducer(eventTargetReducer, initialEventTargetState);
  const eventTargetReducerValues = useMemo(() => (
    { eventTargetState, eventTargetDispatch }), [eventTargetState, eventTargetDispatch]);
  const eventTarget = new EventTarget();

  const handleStep = useCallback(async (step: FundingStep) => {
    if (!checkout || !provider) {
      console.log('@@@@ FundingRouteExecute handleStep if (!checkout || !provider)', checkout, provider);
      return;
    }
    const network = await checkout.getNetworkInfo({
      provider,
    });
    console.log('@@@@ FundingRouteExecute handleStep', step, network.chainId, network.name);

    if (step.type === FundingStepType.BRIDGE) {
      // bridge
      if (network.chainId === getL1ChainId(checkout!.config)) {
        setView(FundingRouteExecuteViews.EXECUTE_BRIDGE);
        return;
      }
      nextView.current = FundingRouteExecuteViews.EXECUTE_BRIDGE;

      setView(FundingRouteExecuteViews.SWITCH_NETWORK_ETH);
    }
    if (step.type === FundingStepType.SWAP) {
      // swap stuff
      if (network.chainId === getL2ChainId(checkout!.config)) {
        setView(FundingRouteExecuteViews.EXECUTE_SWAP);
        return;
      }
      nextView.current = FundingRouteExecuteViews.EXECUTE_SWAP;

      setView(FundingRouteExecuteViews.SWITCH_NETWORK_ZKEVM);
    }
  }, [provider, checkout]);

  // ! useEffect [fundingRouteStep]
  // orchestrate execute views on swap, bridge, network switch
  useEffect(() => {
    if (!fundingRouteStep) {
      return;
    }
    handleStep(fundingRouteStep);
  }, [fundingRouteStep]);

  const handleCustomEvent = (event) => {
    console.log('@@@@ Custom event triggered!', event);
    // Handle the custom event here
    switch (event.detail.type) {
      case BridgeEventType.SUCCESS: {
        console.log('@@@@  BridgeEventType.SUCCESS', event);
        // const eventData = event.detail.data as BridgeSuccess;
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
        console.log('@@@@  SwapEventType.SUCCESS', event);
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
        console.log('invalid event');
    }
  };

  useEffect(() => {
    // Handle the connect event when switching networks
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);

    // Handle the other widget events
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, handleCustomEvent);
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, handleCustomEvent);

    // Remove the custom event listener when the component unmounts
    return () => {
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleCustomEvent);
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, handleCustomEvent);
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    eventTargetDispatch({
      payload: {
        type: EventTargetActions.SET_EVENT_TARGET,
        eventTarget,
      },
    });
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          subView: FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE,
          type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
        },
      },
    });
  }, [checkout]);

  return (
    <EventTargetContext.Provider value={eventTargetReducerValues}>
      { view === FundingRouteExecuteViews.LOADING && (
        <LoadingView loadingText="todo execute loading" />
      )}
      { view === FundingRouteExecuteViews.EXECUTE_BRIDGE && (
        <BridgeWidget
          params={bridgeParams}
          config={config}
        />
      )}
      { view === FundingRouteExecuteViews.EXECUTE_SWAP && (
        <SwapWidget
          params={swapParams}
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
      <Box testId="funding-route-execute">
        <p>
          hello world from FundingRouteExecute
        </p>
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
