import { Box } from '@biom3/react';
import { Fit, Layout, useRive } from '@rive-app/react-canvas';
import { Environment } from '@imtbl/config';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

const rocketHeroUrl = {
  [Environment.PRODUCTION]: 'https://checkout-api.immutable.com/v1/blob/img/rocket.riv',
  [Environment.SANDBOX]: 'https://checkout-cdn.sandbox.immutable.com/v1/blob/img/rocket.riv',
};

interface RocketHeroProps {
  environment: Environment
}

export function RocketHero({
  environment,
}: RocketHeroProps) {
  const { RiveComponent } = useRive({
    src: rocketHeroUrl[environment],
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
