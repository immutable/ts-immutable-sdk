import React, { ComponentProps } from 'react';
import { BiomeCombinedProviders, Box } from '@biom3/react';
import { widgetTheme } from 'lib/theme';
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { usePortalId } from 'lib/hooks/usePortalId';
import { containerStyles } from './themeProviderStyles';

export interface ThemeProviderProps {
  id: string;
  config: StrongCheckoutWidgetsConfig;
  children?: React.ReactNode;
  globalSx?: ComponentProps<typeof BiomeCombinedProviders>['globalSx']
}

export function ThemeProvider({
  id,
  config,
  children,
  globalSx,
}: ThemeProviderProps) {
  const themeBase = widgetTheme(config.theme);
  const portalId = usePortalId();

  return (
    <BiomeCombinedProviders
      globalSx={globalSx}
      theme={{ base: themeBase }}
      drawerContainerId={`${id}${portalId}`}
      modalContainerId={`${id}${portalId}`}
    >
      <Box sx={containerStyles} id={`${id}${portalId}`}>
        {children}
      </Box>
    </BiomeCombinedProviders>
  );
}
