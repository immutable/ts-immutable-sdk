import { Environment } from '@imtbl/config';
import { useEffect } from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { WidgetTheme } from '../../lib';

function SmartWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  useEffect(() => {
    const handleBridgeWidgetEvents = ((event: CustomEvent) => {
      console.log('EVENT OUTER', event);
    }) as EventListener;

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
  });

  return (
    <imtbl-smart-checkout widgetConfig={JSON.stringify(config)} walletProvider="metamask" />
  );
}

export default SmartWebView;
