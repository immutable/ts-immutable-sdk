import React from 'react';
import { WidgetContainer } from 'components/WidgetContainer/WidgetContainer';
import { withDefaultWidgetConfigs } from 'lib/withDefaultWidgetConfig';
import { WidgetTheme } from '@imtbl/checkout-sdk';

export interface TestProps {
  children: React.ReactNode;
  theme?: WidgetTheme
}

export function ViewContextTestComponent({ children, theme }: TestProps) {
  const config = withDefaultWidgetConfigs({
    theme: theme ?? WidgetTheme.DARK,
  });
  return (
    <WidgetContainer
      id="test"
      config={config}
    >
      {children}
    </WidgetContainer>
  );
}
