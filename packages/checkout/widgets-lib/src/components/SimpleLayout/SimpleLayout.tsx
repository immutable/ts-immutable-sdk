import { Box, BoxProps } from '@biom3/react';
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
  bodyStyleOverrides?: BoxProps['sx'];
}

export function SimpleLayout({
  header,
  footer,
  children,
  heroContent,
  testId,
  floatHeader = false,
  footerBackgroundColor,
  bodyStyleOverrides,
}: SimpleLayoutProps) {
  return (
    <Box sx={responsiveStyles} testId="simpleLayout">
      <Box testId={testId} sx={simpleLayoutStyle}>
        {header && (
          <Box sx={headerStyle(floatHeader)} testId="header">
            {header}
          </Box>
        )}
        <Box sx={contentStyle}>
          {heroContent && (
            <Box sx={heroContentStyle} testId="heroContent">
              {heroContent}
            </Box>
          )}
          {children && (
            <Box sx={{ ...bodyStyle, ...bodyStyleOverrides, overflowY: 'auto' }} testId="children">
              {children}
            </Box>
          )}
        </Box>
        {footer && (
          <Box sx={footerStyle(footerBackgroundColor)} testId="footer">
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  );
}
