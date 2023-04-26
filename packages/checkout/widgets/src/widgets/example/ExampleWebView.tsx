import { WidgetTheme, ConnectionProviders } from '@imtbl/checkout-ui-types';
import { useState, useEffect } from 'react';

function ExampleWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
  }, [themeParam]);

  return (
    <imtbl-example
      providerPreference={ConnectionProviders.METAMASK}
      theme={theme}
    ></imtbl-example>
  );
}

export default ExampleWebView;
