import { useEffect } from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';

import {
  WalletEventType,
  IMTBLWidgetEvents,
  WidgetTheme,
  WalletNetworkSwitchEvent,
} from '@imtbl/checkout-ui-types';

function WalletUI() {
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
      <imtbl-wallet
        providerPreference={ConnectionProviders.METAMASK}
        theme={WidgetTheme.DARK}
      ></imtbl-wallet>
    </div>
  );
}

export default WalletUI;
