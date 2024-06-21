import { Heading } from '@biom3/react';
import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { getRemoteImage } from 'lib/utils';
import { Environment } from '@imtbl/config';
import { useMount } from 'hooks/useMount';

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
  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  useMount(() => {
    addHandover({
      duration,
      animationUrl: getRemoteImage(environment, '/handover.riv'),
      animationName: 'Start',
      children: <Heading sx={{ px: 'base.spacing.x6' }}>{text}</Heading>,
    });
  });

  return null;
}
