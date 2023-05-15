import { Box, Logo } from '@biom3/react';
import { HeroBackGroundStyles, HeroImageStyles } from './HeroImageStyles';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';
export const MetamaskConnectHero = () => {
  return (
    <Box testId="metamask-connect-hero" sx={HeroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={HeroImageStyles}>
        <Logo
          testId="metamask-connect-hero-logo"
          logo="MetaMaskSymbol"
          sx={{ width: '206px' }}
        />
      </Box>
    </Box>
  );
};
