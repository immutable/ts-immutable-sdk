import React from 'react';
import { ThemeProvider } from 'components/ThemeProvider/ThemeProvider';
import { withDefaultWidgetConfigs } from 'lib/withDefaultWidgetConfig';
import { Checkout, WidgetTheme } from '@imtbl/checkout-sdk';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

export interface TestProps {
  children: React.ReactNode;
  theme?: WidgetTheme
}

export function ViewContextTestComponent({ children, theme }: TestProps) {
  const config = withDefaultWidgetConfigs({
    theme: theme ?? WidgetTheme.DARK,
  });
  return (
    <I18nextProvider i18n={i18n}>
      <CustomAnalyticsProvider checkout={{} as Checkout}>
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
      </CustomAnalyticsProvider>
    </I18nextProvider>
  );
}
