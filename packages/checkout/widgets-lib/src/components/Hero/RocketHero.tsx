/* eslint-disable max-len */
import { Box } from '@biom3/react';
import { Fit, Layout, useRive } from '@rive-app/react-canvas';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

export function RocketHero() {
  const { RiveComponent } = useRive({
    src: 'https://checkout-cdn.sandbox.immutable.com/v1/blob/img/rocket.riv',
    autoplay: true,
    layout: new Layout({ fit: Fit.Cover }),
  });

  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box
        sx={heroImageStyles}
        rc={<RiveComponent />}
      />
    </Box>
  );
}
