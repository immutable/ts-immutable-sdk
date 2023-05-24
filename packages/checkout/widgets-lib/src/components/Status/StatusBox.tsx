import { Body, Box, Icon } from '@biom3/react';
import { statusBoxStyles, statusLogoFill } from './StatusViewStyles';
import { StatusType } from './StatusType';

export interface StatusViewProps {
  statusText: string;
  statusType: StatusType;
}
export function StatusBox({ statusText, statusType }: StatusViewProps) {
  let icon: string;
  let statusTestId: string;

  switch (statusType) {
    case StatusType.SUCCESS:
      icon = 'TickWithCircle';
      statusTestId = 'success';
      break;
    case StatusType.REJECTED:
      icon = 'Shield';
      statusTestId = 'rejected';
      break;
    case StatusType.FAILURE:
    default:
      icon = 'CloseWithCircle';
      statusTestId = 'failure';
  }

  const isSuccess = statusType === StatusType.SUCCESS;

  return (
    <Box sx={statusBoxStyles} testId={`${statusTestId}-box`}>
      <Icon
        icon={icon as any}
        testId={`${statusTestId}-icon`}
        variant="bold"
        sx={statusLogoFill(isSuccess)}
      />
      <Body size="medium" weight="bold" testId={`${statusTestId}-text`}>
        {statusText}
      </Body>
    </Box>
  );
}
