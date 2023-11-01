/* eslint-disable max-len */
import { Box } from '@biom3/react';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';
import PurpleDownGradient from '../../assets/PurpleDownGradient.svg';
import Satellite from '../../assets/Satellite.svg';

export function SatelliteHero() {
  return (
    <Box sx={heroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={heroImageStyles}>
        <Satellite />
      </Box>
    </Box>
  );
}
