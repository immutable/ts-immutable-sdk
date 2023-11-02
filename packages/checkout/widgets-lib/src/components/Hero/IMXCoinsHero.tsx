/* eslint-disable max-len */
import { Box } from '@biom3/react';
import { heroBackGroundStyles, heroImageBottomAlign, heroImageStyles } from './HeroImageStyles';
import ZkEVMIMXCoins from '../../assets/ZkEVMIMXCoins.svg';

export function IMXCoinsHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={{ ...heroImageStyles, ...heroImageBottomAlign }}>
        <ZkEVMIMXCoins />
      </Box>
    </Box>
  );
}
