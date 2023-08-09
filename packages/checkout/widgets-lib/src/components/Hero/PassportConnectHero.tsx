import { Box, Logo } from '@biom3/react';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';

export function PassportConnectHero() {
  return (
    <Box testId="passport-connect-hero" sx={heroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={heroImageStyles}>
        <Logo
          testId="passport-connect-hero-logo"
          logo="PassportSymbolOutlined"
          sx={{ width: '160px' }}
        />
      </Box>
    </Box>
  );
}
