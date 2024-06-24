import { Box } from '@biom3/react';
import { useEffect } from 'react';
import {
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from '@rive-app/react-canvas-lite';

export function HandoverAnimation({
  url,
  inputValue = 0,
}: {
  url: string;
  inputValue?: number;
}) {
  const STATE_MACHINE_NAME = 'State';
  const INPUT_NAME = 'mode';

  const riveParams = {
    src: url,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
    stateMachines: STATE_MACHINE_NAME,
  };

  const { rive, RiveComponent } = useRive(riveParams);
  const input = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);

  useEffect(() => {
    if (rive) {
      console.log('@@@', rive.contents);
      console.log('@@@ url', url);
      console.log('@@@ inputValue', inputValue);

      if (input && input.value !== undefined) {
        input.value = inputValue;
      } else {
        // eslint-disable-next-line no-console
        console.warn('Input value does not exist or is not ready yet.');
      }
    }
  }, [rive, inputValue, url]);

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
