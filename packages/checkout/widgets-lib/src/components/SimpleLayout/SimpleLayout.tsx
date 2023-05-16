import { Box } from '@biom3/react';
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
}

export function SimpleLayout({
  header,
  footer,
  children,
  heroContent,
  testId,
  floatHeader = false,
}: SimpleLayoutProps) {
  return (
    <Box sx={responsiveStyles}>
      <Box testId={testId} sx={simpleLayoutStyle}>
        {header && (
          <Box id="header" sx={headerStyle(floatHeader)}>
            {header}
          </Box>
        )}
        <Box id="content" sx={contentStyle}>
          {heroContent && (
            <Box id="hero-content" sx={heroContentStyle}>
              {heroContent}
            </Box>
          )}
          {children && (
            <Box id="body" sx={bodyStyle}>
              {children}
            </Box>
          )}
        </Box>
        {footer && (
          <Box id="footer" sx={footerStyle}>
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  );
}
