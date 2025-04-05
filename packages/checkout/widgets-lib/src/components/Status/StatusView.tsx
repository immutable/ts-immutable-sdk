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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender.current, onRenderEvent]);

  const onStatusActionClick = () => {
    if (onActionClick) {
      onActionClick();
    }
  };

  return (
    <SimpleLayout
      footer={<FooterLogo />}
      header={<HeaderNavigation onCloseButtonClick={onCloseClick} />}
      floatHeader
    >
      <Box testId="status-view-container" sx={statusContainerStyles}>
        <CenteredBoxContent testId={testId}>
          <StatusBox statusText={statusText} statusType={statusType} iconStyles={statusIconStyles} />
        </CenteredBoxContent>

        {actionText && onActionClick && (
          <Box
            sx={{
              paddingX: 'base.spacing.x4',
              paddingBottom: 'base.spacing.x2',
            }}
          >
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
        )}

        {secondaryActionText && onSecondaryActionClick && (
          <Box
            sx={{
              paddingX: 'base.spacing.x4',
              paddingBottom: 'base.spacing.x4',
            }}
          >
            <Button
              sx={{ width: '100%' }}
              testId="status-action-button"
              variant="tertiary"
              size="large"
              onClick={onSecondaryActionClick}
            >
              {secondaryActionText}
            </Button>
          </Box>
        )}
      </Box>
    </SimpleLayout>
  );
}
