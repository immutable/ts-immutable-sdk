import { Body, Box, Icon } from '@biom3/react';
import { StatusType } from '../../types';

export interface StatusViewProps {
  statusText: string;
  statusType: StatusType;
}

const status = {
  [StatusType.SUCCESS]: 'TickWithCircle',
  [StatusType.WARNING]: 'Shield',
  [StatusType.FAILURE]: 'CloseWithCircle',
};

const statusLogoFill = (isSuccess: boolean) => ({
  width: 'base.icon.size.500',
  fill: isSuccess
    ? 'base.color.status.success.bright'
    : 'base.color.status.fatal.bright',
});

export function StatusBox({ statusText, statusType }: StatusViewProps) {
  const isSuccess = statusType === StatusType.SUCCESS;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        padding: '24px 16px 24px 12px',
        width: '270px',
        borderRadius: '12px',
        background: 'base.color.translucent.standard.100',
        rowGap: 'base.spacing.x4',
      }}
      testId={`${statusType.toString()}-box`}
    >
      <Icon
        icon={status[statusType] as any}
        testId={`${statusType.toString()}-icon`}
        variant="bold"
        sx={statusLogoFill(isSuccess)}
      />
      <Body
        size="medium"
        weight="bold"
        testId={`${statusType.toString()}-text`}
      >
        {statusText}
      </Body>
    </Box>
  );
}
