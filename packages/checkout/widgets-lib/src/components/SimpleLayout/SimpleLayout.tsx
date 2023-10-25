import {
  BiomeCombinedProviders,
  BiomePortalIdContext,
  Box,
} from '@biom3/react';
import { useContext } from 'react';
import {
  simpleLayoutStyle,
  headerStyle,
  footerStyle,
  bodyStyle,
  contentStyle,
  heroContentStyle,
  responsiveStyles,
} from './SimpleLayoutStyles';

export interface SimpleLayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  heroContent?: React.ReactNode;
  testId?: string;
  floatHeader?: boolean;
  footerBackgroundColor?: string;
}

export function SimpleLayout({
  header,
  footer,
  children,
  heroContent,
  testId,
  floatHeader = false,
  footerBackgroundColor,
}: SimpleLayoutProps) {
  const portalId = useContext(BiomePortalIdContext);

  return (
    <BiomeCombinedProviders drawerContainerId={`layout-container${portalId}`}>
      <Box sx={responsiveStyles} id={`layout-container${portalId}`}>
        <Box testId={testId} sx={simpleLayoutStyle}>
          {header && (
            <Box sx={headerStyle(floatHeader)}>
              {header}
            </Box>
          )}
          <Box sx={contentStyle}>
            {heroContent && (
              <Box sx={heroContentStyle}>
                {heroContent}
              </Box>
            )}
            {children && (
              <Box sx={bodyStyle}>
                {children}
              </Box>
            )}
          </Box>
          {footer && (
            <Box sx={footerStyle(footerBackgroundColor)}>
              {footer}
            </Box>
          )}
        </Box>
      </Box>
    </BiomeCombinedProviders>
  );
}
