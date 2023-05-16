import { Box, Logo } from '@biom3/react';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';

export function MetamaskConnectHero() {
  return (
    <Box testId="metamask-connect-hero" sx={heroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={heroImageStyles}>
        <Logo
          testId="metamask-connect-hero-logo"
          logo="MetaMaskSymbol"
          sx={{ width: '206px' }}
        />
      </Box>
    </Box>
  );
}
