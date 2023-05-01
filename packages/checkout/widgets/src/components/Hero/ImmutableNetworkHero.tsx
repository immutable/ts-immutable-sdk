import { Box } from '@biom3/react';
import { ReactComponent as ImmutableNetwork } from '../../assets/ImmutableNetwork.svg';
import { HeroBackGroundStyles, HeroImageStyles } from './HeroImageStyles';

export const ImmutableNetworkHero = () => {
  return (
    <Box sx={HeroBackGroundStyles}>
      <Box sx={HeroImageStyles}>
        <ImmutableNetwork />
      </Box>
    </Box>
  );
};
