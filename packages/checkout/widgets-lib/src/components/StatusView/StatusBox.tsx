import { Body, Box, Icon } from '@biom3/react';
import { statusBoxStyles, statusLogoStyles } from './StatusViewStyles';
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
      icon = 'Tick';
      statusTestId = 'success';
      break;
    case StatusType.FAILURE: icon = 'Close';
      statusTestId = 'failure';
      break;
    case StatusType.REJECTED: icon = 'Surge';
      statusTestId = 'rejected';
      break;
    default:
      icon = 'Tick';
      statusTestId = 'success';
  }

  const isSuccess = statusType === StatusType.SUCCESS;

  return (
    <Box sx={statusBoxStyles} testId={`${statusTestId}-box`}>
      <Box sx={statusLogoStyles(isSuccess)}>
        <Icon
          icon={icon as any}
          testId={`${statusTestId}-icon`}
          variant="bold"
          sx={{ width: 'base.icon.size.400', fill: 'base.color.brand.2' }}
        />
      </Box>
      <Body size="medium" weight="bold" testId={`${statusTestId}-text`}>
        {statusText}
      </Body>
    </Box>
  );
}
