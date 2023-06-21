import {
  CheckoutWidgets,
  WidgetTheme,
  UpdateConfig,
  CheckoutWidgetsConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { MainPage } from './MainPage';
import { useEffect } from 'react';
import { WidgetProvider } from './WidgetProvider';

export const Marketplace = () => {
  useEffect(() => {
    CheckoutWidgets({
      theme: WidgetTheme.DARK,
      environment: Environment.SANDBOX,
    });

    const widgetsConfig: CheckoutWidgetsConfig = {
      theme: WidgetTheme.DARK,
      environment: Environment.SANDBOX,
      isOnRampEnabled: false,
      isBridgeEnabled: true,
      isSwapEnabled: true
    };
  
    UpdateConfig(widgetsConfig);
  },[]);

  return (
    <WidgetProvider>
      <MainPage />
    </WidgetProvider>
  );
};
