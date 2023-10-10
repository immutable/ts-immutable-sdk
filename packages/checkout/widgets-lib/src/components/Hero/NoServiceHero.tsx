import { Box } from '@biom3/react';
import { ReactComponent as NoService } from '../../assets/NoService.svg';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function NoServiceHero() {
  return (
    <Box
      sx={{
        ...heroBackGroundStyles,
        background: 'base.color.translucent.emphasis.100',
      }}
    >
      <Box sx={heroImageStyles}>
        <NoService />
      </Box>
    </Box>
  );
}
