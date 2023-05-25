import { Body, Box, Icon } from '@biom3/react';
import { statusBoxStyles, statusLogoFill } from './StatusViewStyles';
import { StatusType } from './StatusType';

export interface StatusViewProps {
  statusText: string;
  statusType: StatusType;
}

const status = {
  [StatusType.SUCCESS]: 'TickWithCircle',
  [StatusType.REJECTED]: 'Shield',
  [StatusType.FAILURE]: 'CloseWithCircle',
};

export function StatusBox({ statusText, statusType }: StatusViewProps) {
  const isSuccess = statusType === StatusType.SUCCESS;

  return (
    <Box sx={statusBoxStyles} testId={`${statusType.toString()}-box`}>
      <Icon
        icon={status[statusType] as any}
        testId={`${statusType.toString()}-icon`}
        variant="bold"
        sx={statusLogoFill(isSuccess)}
      />
      <Body size="medium" weight="bold" testId={`${statusType.toString()}-text`}>
        {statusText}
      </Body>
    </Box>
  );
}
