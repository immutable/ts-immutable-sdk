import { Box } from '@biom3/react';
import { ReactComponent as Bridge } from '../../assets/Bridge.svg';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function BridgeHero() {
  return (
    <Box sx={heroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={heroImageStyles}>
        <Bridge />
      </Box>
    </Box>
  );
}
