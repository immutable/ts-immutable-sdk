import { Box, Button } from '@biom3/react';
import { useEffect } from 'react';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';
import { StatusBox } from './StatusBox';
import { StatusType } from './StatusType';
import { FooterLogo } from '../Footer/FooterLogo';
import { statusContainerStyles } from './StatusViewStyles';

export interface StatusViewProps {
  actionText: string;
  onActionClick: () => void;
  onRenderEvent?: () => void;
  testId: string;
  statusText: string;
  statusType: StatusType;
}

export function StatusView({
  actionText,
  onActionClick,
  onRenderEvent,
  testId,
  statusText,
  statusType,
}: StatusViewProps) {
  useEffect(() => {
    if (onRenderEvent) {
      onRenderEvent();
    }
  }, []);

  const onStatusActionClick = () => {
    if (onActionClick) {
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
            variant="secondary"
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
