import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
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
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={theme}
      orderId={'2345'}
    ></imtbl-buy>
  );
}

export default BuyWebView;
