/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box } from '@biom3/react';
import { FundingStep, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  BridgeEventType, BridgeFailed, BridgeReact, BridgeSuccess,
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  IMTBLWidgetEvents, OrchestrationEventType, UpdateConfig, WidgetTheme,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { useContext, useEffect } from 'react';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { BridgeWidgetParams } from '../../../bridge/BridgeWidget';

type FundingRouteExecuteBridgeProps = {
  fundingRouteStep: FundingStep;
  onFundingRouteExecuted: () => void;
};
export function FundingRouteExecuteBridge(
  { fundingRouteStep, onFundingRouteExecuted }: FundingRouteExecuteBridgeProps,
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

  const bridgeParams: BridgeWidgetParams = {
    amount: '1',
    fromContractAddress: undefined,
  };

  const handleBridgeWidgetEvents = ((event: CustomEvent) => {
    switch (event.detail.type) {
      case BridgeEventType.SUCCESS: {
        const eventData = event.detail.data as BridgeSuccess;
        console.log('@@@ FundingRouteExecuteBridge Bridge done');
        setTimeout(() => {
          console.log('@@@ FundingRouteExecuteBridge 1s wait over, moving on');
          onFundingRouteExecuted();
        }, 1000);
        break;
      }
      case BridgeEventType.FAILURE: {
        const eventData = event.detail.data as BridgeFailed;
        break;
      }
      case BridgeEventType.CLOSE_WIDGET: {
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
      IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
      handleBridgeWidgetEvents,
    );

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
        handleBridgeWidgetEvents,
      );
    };
  }, [fundingRouteStep, provider]);
  return (
    <Box testId="funding-route-execute-bridge">
      <BridgeReact
        walletProvider={WalletProviderName.METAMASK}
        amount="50"
        fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
      />

    </Box>
  );
}
