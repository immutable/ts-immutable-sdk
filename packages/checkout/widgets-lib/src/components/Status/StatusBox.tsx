import { Body, Box, Icon } from '@biom3/react';
import { statusBoxStyles, statusLogoFill } from './StatusViewStyles';
import { StatusType } from './StatusType';

export interface StatusViewProps {
  statusText: string;
  statusType: StatusType;
}

const status = {
  [StatusType.SUCCESS]: 'TickWithCircle',
  [StatusType.WARNING]: 'Shield',
  [StatusType.FAILURE]: 'CloseWithCircle',
  [StatusType.INFORMATION]: 'InformationCircle',
};

export function StatusBox({ statusText, statusType }: StatusViewProps) {
  const isSuccess = statusType === StatusType.SUCCESS;

  return (
    <Box sx={statusBoxStyles} testId={`${statusType}-box`}>
      <Icon
        icon={status[statusType] as any}
        testId={`${statusType}-icon`}
        variant="bold"
        sx={statusLogoFill(isSuccess)}
      />
      <Body
        size="medium"
        weight="bold"
        testId={`${statusType}-text`}
        sx={{ textAlign: 'center' }}
      >
        {statusText}
      </Body>
    </Box>
  );
}
