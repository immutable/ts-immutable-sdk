import { Box, Logo } from '@biom3/react';
import { FooterLogoStyles } from './FooterStyles';
export interface FooterLogoProps {
  hideLogo?: boolean;
}
export const FooterLogo = ({ hideLogo }: FooterLogoProps) => {
  const showLogo = !hideLogo;
  return (
    <Box testId="footer-logo-container" sx={FooterLogoStyles}>
      {showLogo && (
        <Logo
          logo="ImmutableHorizontalLockup"
          sx={{ width: 'base.spacing.x25' }}
        />
      )}
    </Box>
  );
};
