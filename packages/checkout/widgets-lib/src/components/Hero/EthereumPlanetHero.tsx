import { Box } from '@biom3/react';
import { ReactComponent as EthereumPlanet } from '../../assets/EthereumPlanet.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function EthereumPlanetHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={heroImageStyles}>
        <EthereumPlanet />
      </Box>
    </Box>
  );
}
