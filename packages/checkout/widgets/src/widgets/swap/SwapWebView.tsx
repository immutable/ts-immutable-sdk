import { WidgetTheme, ConnectionProviders } from '@imtbl/checkout-ui-types';
import { useState, useEffect } from 'react';

function SwapWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
  }, [themeParam]);

  return (
    <imtbl-swap
      providerPreference={ConnectionProviders.METAMASK}
      theme={theme}
      amount="50000000000000000000"
      fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
      toContractAddress=""
    ></imtbl-swap>
  );
}

export default SwapWebView;
