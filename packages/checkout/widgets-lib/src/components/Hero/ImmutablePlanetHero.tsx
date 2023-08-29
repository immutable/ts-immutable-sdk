import { Box } from '@biom3/react';
import { ReactComponent as ImmutablePlanet } from '../../assets/ImmutablePlanet.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function ImmutablePlanetHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={heroImageStyles}>
        <ImmutablePlanet />
      </Box>
    </Box>
  );
}
