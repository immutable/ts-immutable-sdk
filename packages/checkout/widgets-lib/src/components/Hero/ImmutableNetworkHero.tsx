import { Box } from '@biom3/react';
import { ReactComponent as ImmutableNetwork } from '../../assets/ImmutableNetwork.svg';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function ImmutableNetworkHero() {
  return (
    <Box sx={heroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={heroImageStyles}>
        <ImmutableNetwork />
      </Box>
    </Box>
  );
}
