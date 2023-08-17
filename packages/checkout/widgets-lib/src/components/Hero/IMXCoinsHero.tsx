import { Box } from '@biom3/react';
import { ReactComponent as ZkEVMIMXCoins } from '../../assets/ZkEVMIMXCoins.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function IMXCoinsHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={{ ...heroImageStyles, paddingTop: 'base.spacing.x20' }}>
        <ZkEVMIMXCoins />
      </Box>
    </Box>
  );
}
