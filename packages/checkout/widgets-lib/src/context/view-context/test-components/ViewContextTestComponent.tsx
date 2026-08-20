import React from 'react';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { I18nextProvider } from 'react-i18next';
import { Environment } from '@imtbl/config';
import { ThemeProvider } from '../../../components/ThemeProvider/ThemeProvider';
import { withDefaultWidgetConfigs } from '../../../lib/withDefaultWidgetConfig';
import i18n from '../../../i18n';

export interface TestProps {
  children: React.ReactNode;
  theme?: WidgetTheme
}

export function ViewContextTestComponent({ children, theme }: TestProps) {
  const config = withDefaultWidgetConfigs({
    theme: theme ?? WidgetTheme.DARK,
    themeOverrides: undefined,
    environment: Environment.SANDBOX,
    isOnRampEnabled: true,
    isSwapEnabled: true,
    isBridgeEnabled: true,
    isAddTokensEnabled: true,
  });
  return (
    <I18nextProvider i18n={i18n}>

      <ThemeProvider
        id="test"
        config={config}
        globalSx={{
          body: {
            bg: 'base.color.neutral.800',
          },
        }}
      >
        {children}
      </ThemeProvider>

    </I18nextProvider>
  );
}
