import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { useState, useEffect } from 'react';

function BridgeWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);
  const [environment, setEnvironment] = useState(Environment.SANDBOX);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');
  const environmentParam = queryParams.get('environment');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
    if (environmentParam) setEnvironment(environmentParam as Environment);
  }, [themeParam, environmentParam]);

  return (
    <imtbl-bridge
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={theme}
      environment={environment}
      amount="50"
      fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
      fromNetwork="Goerli"
    ></imtbl-bridge>
  );
}

export default BridgeWebView;
