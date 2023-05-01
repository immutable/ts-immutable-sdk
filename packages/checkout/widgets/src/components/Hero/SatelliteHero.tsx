import { Box } from '@biom3/react';
import satellite from '../../assets/Satellite.svg';
import { HeroBackGroundStyles, HeroImageStyles } from './HeroImageStyles';

export const SatelliteHero = () => {
  return (
    <Box sx={HeroBackGroundStyles}>
      <Box sx={HeroImageStyles}>
        <img alt="Satellite" src={satellite} />
      </Box>
    </Box>
  );
};
