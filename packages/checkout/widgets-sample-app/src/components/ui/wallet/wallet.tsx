import { useEffect } from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';

import {
  WalletEventType,
  IMTBLWidgetEvents,
  WidgetTheme,
  WalletNetworkSwitchEvent,
  CheckoutWidgets,
  WalletWidgetReact,
} from '@imtbl/checkout-widgets';

function WalletUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
  });
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
      <WalletWidgetReact providerPreference={ConnectionProviders.METAMASK} />
    </div>
  );
}

export default WalletUI;
