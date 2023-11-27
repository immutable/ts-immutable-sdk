import React from 'react';
import { BiomeCombinedProviders, Box } from '@biom3/react';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { widgetTheme } from 'lib/theme';
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { usePortalId } from 'lib/hooks/usePortalId';
import { containerStyles } from './widgetContainerStyles';

export interface WidgetContainerProps {
  id: string;
  config: StrongCheckoutWidgetsConfig;
  children?: React.ReactNode;
}

export function WidgetContainer({
  id,
  config,
  children,
}: WidgetContainerProps) {
  const themeBase = widgetTheme(config.theme);
  const portalId = usePortalId();

  return (
    <React.StrictMode>
      <CustomAnalyticsProvider widgetConfig={config}>
        <BiomeCombinedProviders theme={{ base: themeBase }} drawerContainerId={`${id}${portalId}`}>
          <Box sx={containerStyles} id={`${id}${portalId}`}>
            {children}
          </Box>
        </BiomeCombinedProviders>
      </CustomAnalyticsProvider>
    </React.StrictMode>
  );
}
