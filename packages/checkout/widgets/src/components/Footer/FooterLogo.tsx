import { Box, useTheme } from '@biom3/react';
import { FooterLogoStyles } from './FooterStyles';
import { ReactComponent as PoweredByImmutableLogo } from '../../assets/PoweredByImmutableLogo.svg';
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
      {showLogo && <PoweredByImmutableLogo fill={color.brand[1]} />}
    </Box>
  );
};
