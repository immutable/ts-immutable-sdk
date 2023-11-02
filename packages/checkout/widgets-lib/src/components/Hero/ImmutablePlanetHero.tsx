/* eslint-disable max-len */
import { Box } from '@biom3/react';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';
import ImmutablePlanet from '../../assets/ImmutablePlanet.svg';

export function ImmutablePlanetHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={heroImageStyles}>
        <ImmutablePlanet />
      </Box>
    </Box>
  );
}
