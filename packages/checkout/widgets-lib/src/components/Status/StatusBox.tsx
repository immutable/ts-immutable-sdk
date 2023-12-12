import { Body, Box, Icon } from '@biom3/react';
import { statusBoxStyles, statusLogoFill } from './StatusViewStyles';
import { StatusType } from './StatusType';

export interface StatusViewProps {
  statusText: string;
  statusType: StatusType;
  iconStyles?: Record<string, string>;
}

const status = {
  [StatusType.SUCCESS]: 'TickWithCircle',
  [StatusType.WARNING]: 'Shield',
  [StatusType.FAILURE]: 'Close', // TODO: revert back to CloseWithCircle when fixed in BIOME https://immutable.atlassian.net/browse/WT-1987
  [StatusType.INFORMATION]: 'InformationCircle',
};

export function StatusBox({ statusText, statusType, iconStyles }: StatusViewProps) {
  const isSuccess = statusType === StatusType.SUCCESS;

  return (
    <Box sx={statusBoxStyles} testId={`${statusType}-box`}>
      <Icon
        icon={status[statusType] as any}
        testId={`${statusType}-icon`}
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
