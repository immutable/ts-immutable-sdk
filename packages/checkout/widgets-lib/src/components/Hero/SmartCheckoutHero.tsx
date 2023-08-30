import { Box } from '@biom3/react';
import { ReactComponent as Piggy } from '../../assets/SmartCheckout.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function SmartCheckoutHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={heroImageStyles}>
        <Piggy />
      </Box>
    </Box>
  );
}
