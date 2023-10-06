import { Box } from '@biom3/react';
import { FundingStep, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  BridgeEventType,
  BridgeReact,
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  IMTBLWidgetEvents,
  UpdateConfig, WidgetTheme,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { useContext, useEffect } from 'react';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';

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

  const handleBridgeWidgetEvents = ((event: CustomEvent) => {
    switch (event.detail.type) {
      case BridgeEventType.SUCCESS: {
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
      default:
        break;
    }
  }) as EventListener;

  useEffect(() => {
    if (!provider) {
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
