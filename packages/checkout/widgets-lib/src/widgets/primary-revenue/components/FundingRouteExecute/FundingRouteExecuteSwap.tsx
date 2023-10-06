import { Box } from '@biom3/react';
import { FundingStep, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  IMTBLWidgetEvents,
  SwapEventType,
  SwapReact,
  UpdateConfig, WidgetTheme,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { useContext, useEffect } from 'react';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';

type FundingRouteExecuteSwapProps = {
  fundingRouteStep: FundingStep;
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

  const handleSwapWidgetEvents = ((event: CustomEvent) => {
    switch (event.detail.type) {
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
  }) as EventListener;

  useEffect(() => {
    if (!provider) {
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
