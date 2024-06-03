import { Box } from '@biom3/react';
import React, { useEffect } from 'react';
import {
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from '@rive-app/react-canvas-lite';

export function HandoverAnimation({ url, animationName }: { url: string, animationName?: string }) {
  const riveParams = {
    src: url,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
    stateMachines: 'State',
  };
  const { rive, RiveComponent } = useRive(riveParams);
  useStateMachineInput(rive, 'State', 'mode', 0);

  useEffect(() => {
    if (rive) {
      // TODO: hook into animation complete event to auto close handover
      // rive.on(EventType.RiveEvent, (event) => {
      //   console.log('Handover event', event);
      // });
      // rive.on(EventType.Stop, (event) => {
      //   console.log('Handover animation complete', event);
      // });

      if (animationName) {
        if (rive.animationNames.includes(animationName)) {
          rive.play(animationName);
        } else {
          // eslint-disable-next-line no-console
          console.warn('Handover animation not found', animationName);
        }
      }
    }
  }, [rive, animationName]);

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
