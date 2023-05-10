import { Box, Logo, useTheme } from '@biom3/react';
import { FooterLogoStyles } from './FooterStyles';

export interface FooterLogoProps {
  hideLogo?: boolean;
}

export const FooterLogo = ({ hideLogo }: FooterLogoProps) => {
  const showLogo = !hideLogo;
  const {
    base: { color },
  } = useTheme();
  return (
    <Box testId="footer-logo-container" sx={FooterLogoStyles}>
      {showLogo && (
        <Logo sx={{ width: '100px' }} logo="ImmutableHorizontalLockup" />
      )}
    </Box>
  );
};
