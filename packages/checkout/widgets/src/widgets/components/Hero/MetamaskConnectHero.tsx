import { Box, Logo } from '@biom3/react';
import React from 'react';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function MetamaskConnectHero() {
  return (
    <Box testId="metamask-connect-hero" sx={heroBackGroundStyles}>
      <Box sx={{ ...heroImageStyles, background: 'base.color.translucent.emphasis.100' }}>
        <Logo
          testId="metamask-connect-hero-logo"
          logo="MetaMaskSymbol"
          sx={{ width: '206px', position: 'absolute', top: 'base.spacing.x17' }}
        />
      </Box>
    </Box>
  );
}
