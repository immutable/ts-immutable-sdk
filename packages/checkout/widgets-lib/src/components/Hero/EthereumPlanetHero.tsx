/* eslint-disable max-len */
import { Box } from '@biom3/react';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';
import EthereumPlanet from '../../assets/EthereumPlanet.svg';

export function EthereumPlanetHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={heroImageStyles}>
        <EthereumPlanet />
      </Box>
    </Box>
  );
}
