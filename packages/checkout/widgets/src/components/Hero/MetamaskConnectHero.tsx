import { Box, Logo } from '@biom3/react';
import { HeroBackGroundStyles, HeroImageStyles } from './HeroImageStyles';

export const MetamaskConnectHero = () => {
  return (
    <Box testId="metamask-connect-hero" sx={HeroBackGroundStyles}>
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
