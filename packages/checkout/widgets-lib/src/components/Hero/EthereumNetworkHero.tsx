import { Box } from '@biom3/react';
import { ReactComponent as EthereumNetwork } from '../../assets/EthereumNetwork.svg';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function EthereumNetworkHero() {
  return (
    <Box sx={heroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={heroImageStyles}>
        <EthereumNetwork />
      </Box>
    </Box>
  );
}
