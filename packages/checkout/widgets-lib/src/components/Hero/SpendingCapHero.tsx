import { Box } from '@biom3/react';
import { ReactComponent as SpendingCap } from '../../assets/SpendingCap.svg';
import { heroBackGroundStyles, heroImageBottomAlign, heroImageStyles } from './HeroImageStyles';

export function SpendingCapHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={{ ...heroImageStyles, ...heroImageBottomAlign }}>
        <SpendingCap />
      </Box>
    </Box>
  );
}
