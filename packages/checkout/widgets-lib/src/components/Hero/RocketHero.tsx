import { Box } from '@biom3/react';
import { Fit, Layout, useRive } from '@rive-app/react-canvas-lite';
import { Environment } from '@imtbl/config';
import { CHECKOUT_CDN_BASE_URL } from 'lib';
import { heroBackGroundStyles, heroImageStyles } from './HeroImageStyles';

interface RocketHeroProps {
  environment: Environment;
}

export function RocketHero({ environment }: RocketHeroProps) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { RiveComponent } = useRive({
    src: `${CHECKOUT_CDN_BASE_URL[environment]}/v1/blob/img/rocket.riv`,
    autoplay: true,
    layout: new Layout({ fit: Fit.Cover }),
    stateMachines: 'State Machine 1',
  });

  return (
    <Box
      sx={{
        ...heroBackGroundStyles,
        background: 'base.color.translucent.emphasis.100',
      }}
    >
      <Box sx={heroImageStyles} rc={<RiveComponent />} />
    </Box>
  );
}
