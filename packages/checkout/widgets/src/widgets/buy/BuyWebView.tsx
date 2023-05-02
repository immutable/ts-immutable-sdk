import {
  WidgetTheme,
  ConnectionProviders,
} from '@imtbl/checkout-widgets-react';
import { useState, useEffect } from 'react';

function BuyWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
  }, [themeParam]);

  return (
    <imtbl-buy
      providerPreference={ConnectionProviders.METAMASK}
      theme={theme}
      orderId={'2345'}
    ></imtbl-buy>
  );
}

export default BuyWebView;
