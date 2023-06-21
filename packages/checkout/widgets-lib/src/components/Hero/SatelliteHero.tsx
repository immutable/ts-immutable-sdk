import { Box } from '@biom3/react';
import { ReactComponent as Satellite } from '../../assets/Satellite.svg';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

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
