import { Box, BoxProps } from '@biom3/react';
import { merge } from 'ts-deepmerge';
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
  containerSx?: BoxProps['sx'];
}

export function SimpleLayout({
  header,
  footer,
  children,
  heroContent,
  testId = 'container',
  floatHeader = false,
  footerBackgroundColor,
  bodyStyleOverrides,
  containerSx = {},
}: SimpleLayoutProps) {
  return (
    <Box sx={responsiveStyles} testId="simpleLayout">
      <Box testId={testId} sx={merge(simpleLayoutStyle, containerSx)}>
        {header && (
          <Box sx={headerStyle(floatHeader)} testId="header">
            {header}
          </Box>
        )}
        <Box sx={contentStyle} testId="main">
          {heroContent && (
            <Box sx={heroContentStyle}>
              {heroContent}
            </Box>
          )}
          {children && (
            <Box sx={{ ...bodyStyle, ...bodyStyleOverrides }} testId="children">
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
