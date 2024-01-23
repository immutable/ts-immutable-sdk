import {
  AllIconKeys, Body, Box, Icon,
} from '@biom3/react';

import { statusBoxStyles, statusLogoFill } from './StatusViewStyles';
import { StatusType } from './StatusType';

export interface StatusViewProps {
  statusText: string;
  statusType: StatusType;
  iconStyles?: Record<string, string>;
}

const status: Record<StatusType, AllIconKeys> = {
  [StatusType.SUCCESS]: 'TickWithCircle',
  [StatusType.WARNING]: 'Shield',
  [StatusType.FAILURE]: 'CloseWithCircle',
  [StatusType.INFORMATION]: 'InformationCircle',
  [StatusType.ALERT]: 'Alert',
};

export function StatusBox({ statusText, statusType, iconStyles }: StatusViewProps) {
  const isSuccess = statusType === StatusType.SUCCESS;

  return (
    <Box sx={statusBoxStyles} testId={`${statusType}-box`}>
      <Icon
        testId={`${statusType}-icon`}
        icon={status[statusType]}
        variant="bold"
        sx={{
          ...statusLogoFill(isSuccess),
          ...iconStyles || {},
        }}
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
