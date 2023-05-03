import { Box } from '@biom3/react';
import { ReactComponent as Satellite } from '../../assets/Satellite.svg';
import { HeroBackGroundStyles, HeroImageStyles } from './HeroImageStyles';

export const SatelliteHero = () => {
  return (
    <Box sx={HeroBackGroundStyles}>
      <Box sx={HeroImageStyles}>
        <Satellite />
      </Box>
    </Box>
  );
};
