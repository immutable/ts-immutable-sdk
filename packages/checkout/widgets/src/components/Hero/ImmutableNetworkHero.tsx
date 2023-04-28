import { Box } from '@biom3/react';
import immutableNetwork from '../../assets/ImmutableNetwork.svg';
import { HeroBackGroundStyles, HeroImageStyles } from './HeroImageStyles';

export const ImmutableNetworkHero = () => {
  return (
    <Box sx={HeroBackGroundStyles}>
      <Box sx={HeroImageStyles}>
        <img alt="Immutable Network" src={immutableNetwork} />
      </Box>
    </Box>
  );
};
