/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Button } from '@biom3/react';
import { useEffect, useRef } from 'react';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';
import { StatusBox } from './StatusBox';
import { StatusType } from './StatusType';
import { statusContainerStyles } from './StatusViewStyles';
import { HeaderNavigation } from '../Header/HeaderNavigation';

export interface StatusViewProps {
  actionText?: string;
  onActionClick?: () => void;
  secondaryActionText?: string;
  onSecondaryActionClick?: () => void;
  onRenderEvent?: () => void;
  onCloseClick?: () => void;
  testId: string;
  statusText: string;
  statusType: StatusType;
  statusIconStyles?: Record<string, string>;
}

export function StatusView({
  actionText,
  onActionClick,
  secondaryActionText,
  onSecondaryActionClick,
  onRenderEvent,
  onCloseClick,
  testId,
  statusText,
  statusType,
  statusIconStyles,
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
      header={<HeaderNavigation onCloseButtonClick={onCloseClick} />}
      floatHeader
    >
      <Box testId="status-view-container" sx={statusContainerStyles}>
        <CenteredBoxContent testId={testId}>
          <StatusBox statusText={statusText} statusType={statusType} iconStyles={statusIconStyles} />
        </CenteredBoxContent>

        <Box
          sx={{
            padding: 'base.spacing.x4',
            gap: 'base.spacing.x2',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {actionText && onActionClick && (
            <Button
              sx={{ width: '100%' }}
              testId="status-action-button"
              variant="secondary"
              size="large"
              onClick={onStatusActionClick}
            >
              {actionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryActionClick && (
            <Button
              sx={{ width: '100%' }}
              testId="status-action-button"
              variant="tertiary"
              size="large"
              onClick={onSecondaryActionClick}
            >
              {secondaryActionText}
            </Button>
          )}
        </Box>
      </Box>
    </SimpleLayout>
  );
}
