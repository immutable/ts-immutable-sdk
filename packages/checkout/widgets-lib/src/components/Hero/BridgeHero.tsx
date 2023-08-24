import { Box } from '@biom3/react';
import { ReactComponent as Bridge } from '../../assets/Bridge.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function BridgeHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={heroImageStyles}>
        <Bridge />
      </Box>
    </Box>
  );
}
