import { WidgetTheme, ConnectionProviders } from '@imtbl/checkout-widgets';
import { useState, useEffect } from 'react';

function ConnectWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
  }, [themeParam]);

  return (
    <imtbl-connect
      providerPreference={ConnectionProviders.METAMASK}
      theme={theme}
    ></imtbl-connect>
  );
}

export default ConnectWebView;
