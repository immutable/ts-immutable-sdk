import {
  WidgetTheme,
  ConnectionProviders,
} from '@imtbl/checkout-widgets-react';
import { useState, useEffect } from 'react';

function DiExampleWebView() {
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

export default DiExampleWebView;
