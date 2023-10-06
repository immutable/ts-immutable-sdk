import { Box, Logo } from '@biom3/react';
import { footerLogoStyles } from './FooterStyles';

export interface FooterLogoProps {
  hideLogo?: boolean;
}
export function FooterLogo({ hideLogo }: FooterLogoProps) {
  const showLogo = !hideLogo;
  return (
    <Box testId="footer-logo-container" sx={footerLogoStyles}>
      {showLogo && (
        <Logo
          testId="footer-logo-image"
          logo="ImmutableHorizontalLockup"
          sx={{ width: 'base.spacing.x25' }}
        />
      )}
    </Box>
  );
}
