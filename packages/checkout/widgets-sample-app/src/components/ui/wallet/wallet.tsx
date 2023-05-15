import { useEffect } from 'react';
import {
  CheckoutWidgetsConfig,
  UpdateConfig,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';

import {
  WalletEventType,
  IMTBLWidgetEvents,
  WidgetTheme,
  WalletNetworkSwitchEvent,
  CheckoutWidgets,
  WalletReact,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function WalletUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);

  useEffect(() => {
    const handleWalletWidgetEvents = ((event: CustomEvent) => {
      console.log(event);
      switch (event.detail.type) {
        case WalletEventType.CLOSE_WIDGET: {
          const eventData = event.detail.data as any;
          console.log(eventData);
          break;
        }
        case WalletEventType.NETWORK_SWITCH: {
          const eventData = event.detail.data as WalletNetworkSwitchEvent;
          console.log(eventData.network);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
      handleWalletWidgetEvents
    );
    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        handleWalletWidgetEvents
      );
    };
  }, []);
  return (
    <div className="Connect">
      <h1 className="sample-heading">Checkout Wallet (Web Component)</h1>
      <WalletReact
        providerPreference={WidgetConnectionProviders.METAMASK}
        useConnectWidget={true}
        isOnRampEnabled={false}
      />
    </div>
  );
}

export default WalletUI;
