import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { useState, useEffect } from 'react';

function WalletWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
  }, [themeParam]);

  return (
    <imtbl-wallet
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={theme}
    ></imtbl-wallet>
  );
}

export default WalletWebView;
