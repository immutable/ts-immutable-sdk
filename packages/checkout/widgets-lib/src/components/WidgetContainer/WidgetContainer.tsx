import React, { ComponentProps } from 'react';
import { BiomeCombinedProviders, Box } from '@biom3/react';
import { widgetTheme } from 'lib/theme';
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { usePortalId } from 'lib/hooks/usePortalId';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { containerStyles } from './widgetContainerStyles';

export interface WidgetContainerProps {
  id: string;
  config: StrongCheckoutWidgetsConfig;
  children?: React.ReactNode;
  globalSx?: ComponentProps<typeof BiomeCombinedProviders>['globalSx']
}

export function WidgetContainer({
  id,
  config,
  children,
  globalSx,
}: WidgetContainerProps) {
  const themeBase = widgetTheme(WidgetTheme.DARK ?? config.theme);
  const portalId = usePortalId();

  return (
    <React.StrictMode>
      <BiomeCombinedProviders
        globalSx={globalSx}
        theme={{ base: themeBase }}
        drawerContainerId={`${id}${portalId}`}
      >
        <Box sx={containerStyles} id={`${id}${portalId}`}>
          {children}
        </Box>
      </BiomeCombinedProviders>
    </React.StrictMode>
  );
}
