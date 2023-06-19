/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Button } from '@biom3/react';
import { useEffect, useRef } from 'react';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';
import { StatusBox } from './StatusBox';
import { StatusType } from './StatusType';
import { FooterLogo } from '../Footer/FooterLogo';
import { statusContainerStyles } from './StatusViewStyles';
import { HeaderNavigation } from '../Header/HeaderNavigation';

export interface StatusViewProps {
  actionText: string;
  onActionClick: () => void;
  onRenderEvent?: () => void;
  onCloseClick?: () => void;
  testId: string;
  statusText: string;
  statusType: StatusType;
}

export function StatusView({
  actionText,
  onActionClick,
  onRenderEvent,
  onCloseClick,
  testId,
  statusText,
  statusType,
}: StatusViewProps) {
  const firstRender = useRef(true);
  useEffect(() => {
    if (onRenderEvent && firstRender.current) {
      firstRender.current = false;
      onRenderEvent();
    }
  }, [firstRender.current, onRenderEvent]);

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
      header={
        <HeaderNavigation onCloseButtonClick={onCloseClick} />
      }
      floatHeader
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
