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
    <Box sx={responsiveStyles}>
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
            <Box sx={{ ...bodyStyle, ...bodyStyleOverrides }}>
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
  );
}
