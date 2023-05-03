import {
  WidgetTheme,
  ConnectionProviders,
  CheckoutWidgets,
} from '@imtbl/checkout-widgets-react';
import { useState, useEffect } from 'react';

function TransitionExampleWebView() {
  console.log('transition');
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
  }, [themeParam]);

  return (
    <imtbl-transition-example
      providerPreference={ConnectionProviders.METAMASK}
      theme={theme}
    ></imtbl-transition-example>
  );
}

export default TransitionExampleWebView;
