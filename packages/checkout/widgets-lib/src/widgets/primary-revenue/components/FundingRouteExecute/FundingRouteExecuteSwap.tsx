/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box } from '@biom3/react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  IMTBLWidgetEvents, OrchestrationEventType, SwapEventType,
  SwapFailed, SwapReact, SwapRejected, SwapSuccess, UpdateConfig, WidgetTheme,
} from '@imtbl/checkout-widgets';
import { useContext, useEffect } from 'react';
import { Environment } from '@imtbl/config';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { SwapWidgetParams } from '../../../swap/SwapWidget';
import { FundingRouteStep } from '../../views/smartCheckoutTypes';

type FundingRouteExecuteSwapProps = {
  fundingRouteStep: FundingRouteStep;
  onFundingRouteExecuted: () => void;
};
export function FundingRouteExecuteSwap(
  { fundingRouteStep, onFundingRouteExecuted }: FundingRouteExecuteSwapProps,
) {
  const { connectLoaderState: { provider } } = useContext(ConnectLoaderContext);

  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);

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

    const isPassport = (provider?.provider as any)?.isPassport;
    console.log('@@@@@@@ isPassport', isPassport);

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
      <SwapReact
        walletProvider={(provider?.provider as any)?.isPassport
          ? WalletProviderName.PASSPORT
          : WalletProviderName.METAMASK}
        amount="50000000000000000000"
        fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
        toContractAddress=""
      />

    </Box>
  );
}
