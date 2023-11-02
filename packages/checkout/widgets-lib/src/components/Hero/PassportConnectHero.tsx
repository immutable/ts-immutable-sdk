/* eslint-disable max-len */
import { Box } from '@biom3/react';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';
import Passport from '../../assets/Passport.svg';

export function PassportConnectHero() {
  return (
    <Box testId="passport-connect-hero" sx={heroBackGroundStyles}>
      <Box sx={heroImageStyles} testId="passport-connect-hero-logo">
        <Passport />
      </Box>
    </Box>
  );
}
