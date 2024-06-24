import { Heading } from '@biom3/react';
import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { useMount } from 'hooks/useMount';

export interface LoadingHandoverProps {
  text: string;
  duration?: number;
  animationUrl: string;
  inputValue?: number;
}
export function LoadingHandover({
  text,
  duration,
  animationUrl,
  inputValue = 0,
}: LoadingHandoverProps) {
  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  useMount(() => {
    addHandover({
      duration,
      animationUrl,
      inputValue,
      children: <Heading sx={{ px: 'base.spacing.x6' }}>{text}</Heading>,
    });
  });

  return null;
}
