import {
  CheckoutWidgets,
  WidgetTheme,
  UpdateConfig,
  CheckoutWidgetsConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { MainPage } from './MainPage';
import { useEffect, useState } from 'react';
import { WidgetProvider } from './WidgetProvider';

export const Marketplace = () => {
  const [theme, setTheme] = useState(WidgetTheme.DARK)

  useEffect(() => {
    const widgetsConfig: CheckoutWidgetsConfig = {
      theme,
      environment: Environment.SANDBOX,
      isOnRampEnabled: true,
      isBridgeEnabled: true,
      isSwapEnabled: true
    };

    CheckoutWidgets(widgetsConfig);
  },[]);

  useEffect(() => UpdateConfig({ theme }), [theme])

  const handleChangeTheme = () => {
    setTheme(theme === WidgetTheme.DARK ? WidgetTheme.LIGHT : WidgetTheme.DARK)
  }

  return (
    <WidgetProvider>
      <MainPage handleChangeTheme={handleChangeTheme} />
    </WidgetProvider>
  );
};
