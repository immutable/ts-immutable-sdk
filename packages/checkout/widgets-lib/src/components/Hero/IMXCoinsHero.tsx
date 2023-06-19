import { Box } from '@biom3/react';
import { ReactComponent as ZkEVMIMXCoins } from '../../assets/ZkEVMIMXCoins.svg';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function IMXCoinsHero() {
  return (
    <Box sx={heroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={heroImageStyles}>
        <ZkEVMIMXCoins />
      </Box>
    </Box>
  );
}
