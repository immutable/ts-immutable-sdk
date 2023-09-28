import {
  BiomePortalIdContext,
  Box,
  MountedOverlaysAndProvider,
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
    <MountedOverlaysAndProvider bottomSheetContainerId={`layout-container${portalId}`}>
      <Box sx={responsiveStyles} id={`layout-container${portalId}`}>
        <Box testId={testId} sx={simpleLayoutStyle}>
          {header && (
            <Box id={`header${portalId}`} sx={headerStyle(floatHeader)}>
              {header}
            </Box>
          )}
          <Box id={`content${portalId}`} sx={contentStyle}>
            {heroContent && (
              <Box id={`hero-content${portalId}`} sx={heroContentStyle}>
                {heroContent}
              </Box>
            )}
            {children && (
              <Box id={`body${portalId}`} sx={bodyStyle}>
                {children}
              </Box>
            )}
          </Box>
          {footer && (
            <Box id={`footer${portalId}`} sx={footerStyle(footerBackgroundColor)}>
              {footer}
            </Box>
          )}
        </Box>
      </Box>
    </MountedOverlaysAndProvider>
  );
}
