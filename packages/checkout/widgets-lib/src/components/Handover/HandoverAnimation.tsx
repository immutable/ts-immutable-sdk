import { Box } from '@biom3/react';
import React from 'react';
import { Fit, Layout, useRive } from '@rive-app/react-canvas-lite';

export function HandoverAnimation({ url }: { url: string }) {
  const riveParams = {
    src: url,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
    stateMachines: 'State',
  };
  const { RiveComponent } = useRive(riveParams);

  // const riveAnimationState = useStateMachineInput(rive, 'State', 'mode', 0);
  // console.log('Handover setup animation', id, riveAnimationState);

  return (
    <Box
      sx={{
        h: '240px',
        flexShrink: 0,
      }}
      rc={<RiveComponent />}
    />
  );
}
