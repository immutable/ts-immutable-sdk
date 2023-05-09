import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { useState, useEffect } from 'react';

function WalletWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');

  const useConnectWidget = queryParams.get('useConnectWidget') || undefined;
  const isOnRampEnabled = queryParams.get('isOnRampEnabled') || undefined;
  const isSwapEnabled = queryParams.get('isSwapEnabled') || undefined;
  const isBridgeEnabled = queryParams.get('isBridgeEnabled') || undefined;

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
  }, [themeParam]);

  return (
    <imtbl-wallet
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={theme}
      useConnectWidget={useConnectWidget}
      isOnRampEnabled={isOnRampEnabled}
      isSwapEnabled={isSwapEnabled}
      isBridgeEnabled={isBridgeEnabled}
    ></imtbl-wallet>
  );
}

export default WalletWebView;
