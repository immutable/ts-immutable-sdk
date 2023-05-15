import { Box } from '@biom3/react';
import { ReactComponent as ImmutableNetwork } from '../../assets/ImmutableNetwork.svg';
import { ReactComponent as PurpleDownGradient } from '../../assets/PurpleDownGradient.svg';
import { HeroBackGroundStyles, HeroImageStyles } from './HeroImageStyles';

export const ImmutableNetworkHero = () => {
  return (
    <Box sx={HeroBackGroundStyles}>
      <PurpleDownGradient />
      <Box sx={HeroImageStyles}>
        <ImmutableNetwork />
      </Box>
    </Box>
  );
};
