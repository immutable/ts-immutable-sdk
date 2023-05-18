import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { useState, useEffect } from 'react';

function WalletWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);
  const [environment, setEnvironment] = useState(Environment.SANDBOX);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');
  const environmentParam = queryParams.get('environment');

  const useConnectWidget = queryParams.get('useConnectWidget') || undefined;
  const isOnRampEnabled = queryParams.get('isOnRampEnabled') || undefined;
  const isSwapEnabled = queryParams.get('isSwapEnabled') || undefined;
  const isBridgeEnabled = queryParams.get('isBridgeEnabled') || undefined;

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
    if (environmentParam) setEnvironment(environmentParam as Environment);
  }, [themeParam, environmentParam]);

  return (
    <imtbl-wallet
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={theme}
      environment={environment}
      useConnectWidget={useConnectWidget}
      isOnRampEnabled={isOnRampEnabled}
      isSwapEnabled={isSwapEnabled}
      isBridgeEnabled={isBridgeEnabled}
    />
  );
}

export default WalletWebView;
