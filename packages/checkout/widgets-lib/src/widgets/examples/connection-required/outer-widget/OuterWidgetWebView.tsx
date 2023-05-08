import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { useState, useEffect } from 'react';

function OuterWidgetWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
  }, [themeParam]);

  return (
    <imtbl-outer-widget-example
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={theme}
    ></imtbl-outer-widget-example>
  );
}

export default OuterWidgetWebView;
