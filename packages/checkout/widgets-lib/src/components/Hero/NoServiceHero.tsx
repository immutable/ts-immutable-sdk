/* eslint-disable max-len */
import { Box } from '@biom3/react';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';
import NoService from '../../assets/NoService.svg';

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
