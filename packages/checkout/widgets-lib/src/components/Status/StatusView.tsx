import { Box, Button } from '@biom3/react';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';
import { StatusBox } from './StatusBox';
import { StatusType } from './StatusType';
import { FooterLogo } from '../Footer/FooterLogo';
import { statusContainerStyles } from './StatusViewStyles';

export interface StatusViewProps {
  actionText: string;
  onActionClick: () => void;
  statusEventAction?: () => void;
  testId: string;
  statusText: string;
  statusType: StatusType;
}

export function StatusView({
  actionText,
  onActionClick,
  statusEventAction,
  testId,
  statusText,
  statusType,
}: StatusViewProps) {
  if (
    statusEventAction !== undefined
    && typeof statusEventAction === 'function'
  ) {
    statusEventAction();
  }
  const onStatusActionClick = () => {
    if (onActionClick !== undefined && typeof onActionClick === 'function') {
      onActionClick();
    }
  };

  return (
    <SimpleLayout
      footer={(
        <FooterLogo />
      )}
    >
      <Box
        testId="status-view-container"
        sx={statusContainerStyles}
      >
        <CenteredBoxContent testId={testId}>
          <StatusBox statusText={statusText} statusType={statusType} />
        </CenteredBoxContent>

        <Box sx={{ paddingX: 'base.spacing.x4' }}>
          <Button
            sx={{ width: '100%' }}
            testId="status-action-button"
            variant="primary"
            size="large"
            onClick={onStatusActionClick}
          >
            {actionText}
          </Button>
        </Box>

      </Box>
    </SimpleLayout>
  );
}
