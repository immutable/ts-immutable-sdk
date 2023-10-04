/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box } from '@biom3/react';
import { FundingStep } from '@imtbl/checkout-sdk';
import {
  IMTBLWidgetEvents, OrchestrationEventType, SwapEventType, SwapFailed, SwapRejected, SwapSuccess,
} from '@imtbl/checkout-widgets';
import { useContext, useEffect } from 'react';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { withDefaultWidgetConfigs } from '../../../../lib/withDefaultWidgetConfig';
import { SwapWidget, SwapWidgetParams } from '../../../swap/SwapWidget';

type FundingRouteExecuteSwapProps = {
  fundingRouteStep: FundingStep;
  onFundingRouteExecuted: () => void;
};
export function FundingRouteExecuteSwap(
  { fundingRouteStep, onFundingRouteExecuted }: FundingRouteExecuteSwapProps,
) {
  const { connectLoaderState: { provider } } = useContext(ConnectLoaderContext);

  const swapParams: SwapWidgetParams = {
    amount: '1',
    fromContractAddress: undefined,
    toContractAddress: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  };

  const handleSwapWidgetEvents = ((event: CustomEvent) => {
    switch (event.detail.type) {
      case SwapEventType.SUCCESS: {
        const eventData = event.detail.data as SwapSuccess;
        console.log('@@@ FundingRouteExecuteSwap Swap done');
        setTimeout(() => {
          console.log('@@@ FundingRouteExecuteSwap 1s wait over, moving on');
          onFundingRouteExecuted();
        }, 1000);
        break;
      }
      case SwapEventType.FAILURE: {
        const eventData = event.detail.data as SwapFailed;
        break;
      }
      case SwapEventType.REJECTED: {
        const eventData = event.detail.data as SwapRejected;
        break;
      }
      case SwapEventType.CLOSE_WIDGET: {
        break;
      }
      case OrchestrationEventType.REQUEST_CONNECT:
      case OrchestrationEventType.REQUEST_WALLET:
      case OrchestrationEventType.REQUEST_SWAP:
      case OrchestrationEventType.REQUEST_BRIDGE:
      case OrchestrationEventType.REQUEST_ONRAMP: {
        break;
      }
      default:
        console.log('did not match any expected event type');
    }
  }) as EventListener;

  useEffect(() => {
    if (!provider) {
      console.error('missing provider, please connect frist');
      return () => {};
    }
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
      handleSwapWidgetEvents,
    );

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
        handleSwapWidgetEvents,
      );
    };
  }, [fundingRouteStep, provider]);

  return (
    <Box testId="funding-route-execute-swap">
      <SwapWidget
        params={swapParams}
        config={withDefaultWidgetConfigs()}
      />

    </Box>
  );
}
