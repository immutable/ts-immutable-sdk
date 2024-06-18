import { Heading } from '@biom3/react';
import { useEffect, useRef } from 'react';
import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { getRemoteImage } from 'lib/utils';
import { Environment } from '@imtbl/config';

export interface LoadingHandoverProps {
  text: string;
  environment: Environment;
  duration?: number;
}
export function LoadingHandover({
  text,
  environment,
  duration,
}: LoadingHandoverProps) {
  const initialHandoverDone = useRef(false);

  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  useEffect(() => {
    if (initialHandoverDone.current) return;

    addHandover({
      duration,
      animationUrl: getRemoteImage(environment, '/handover.riv'),
      animationName: 'Start',
      children: <Heading sx={{ px: 'base.spacing.x6' }}>{text}</Heading>,
    });
    initialHandoverDone.current = true;
  }, []);

  return null;
}
