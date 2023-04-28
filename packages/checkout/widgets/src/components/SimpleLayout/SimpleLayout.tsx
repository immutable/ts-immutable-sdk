import { Box } from '@biom3/react';
import {
  SimpleLayoutStyle,
  HeaderStyle,
  FooterStyle,
  BodyStyle,
  ContentStyle,
  HeroContent,
} from './SimpleLayoutStyles';

export interface SimpleLayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  heroContent?: React.ReactNode;
  testId?: string;
  floatHeader?: boolean;
}

export const SimpleLayout = ({
  header,
  footer,
  children,
  heroContent,
  testId,
  floatHeader = false,
}: SimpleLayoutProps) => {
  return (
    <Box testId={testId} sx={SimpleLayoutStyle}>
      {header && (
        <Box id="header" sx={HeaderStyle(floatHeader)}>
          {header}
        </Box>
      )}
      <Box id="content" sx={ContentStyle}>
        {heroContent && (
          <Box id="hero-content" sx={HeroContent}>
            {heroContent}
          </Box>
        )}
        {children && (
          <Box id="body" sx={BodyStyle}>
            {children}
          </Box>
        )}
      </Box>
      {footer && (
        <Box id="footer" sx={FooterStyle}>
          {footer}
        </Box>
      )}
    </Box>
  );
};
