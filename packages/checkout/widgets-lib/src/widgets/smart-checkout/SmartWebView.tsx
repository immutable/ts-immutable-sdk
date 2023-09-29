import { Environment } from '@imtbl/config';
import { useEffect, useState } from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { WidgetTheme } from '../../lib';

function SmartWebView() {
  const [config, setConfig] = useState({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

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

  const changeTheme = () => {
    if (config.theme === WidgetTheme.DARK) {
      setConfig({
        theme: WidgetTheme.LIGHT,
        environment: Environment.SANDBOX,
      });
    } else {
      setConfig({
        theme: WidgetTheme.DARK,
        environment: Environment.SANDBOX,
      });
    }
  };

  return (
    <div>
      <imtbl-smart-checkout widgetConfig={JSON.stringify(config)} walletProvider="metamask" />
      <button type="button" onClick={changeTheme}>Change Theme</button>
      <p>
        current theme:
        {config.theme}
      </p>
    </div>

  );
}

export default SmartWebView;
