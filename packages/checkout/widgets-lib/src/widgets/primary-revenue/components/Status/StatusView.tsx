/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Button } from '@biom3/react';
import { useEffect, useRef } from 'react';
import { StatusBox } from './StatusBox';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { CenteredBoxContent } from '../../../../components/CenteredBoxContent/CenteredBoxContent';
import { StatusType } from '../../types';

export interface StatusViewProps {
  actionText: string;
  optionalText?: string;
  onActionClick: () => void;
  onOptionalActionClick?: () => void;
  onRenderEvent?: () => void;
  onCloseClick?: () => void;
  testId: string;
  statusText: string;
  statusType: StatusType;
}

export function StatusView({
  actionText,
  optionalText,
  onActionClick,
  onOptionalActionClick,
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

  const onStatusOptionalActionClick = () => {
    if (onOptionalActionClick) {
      onOptionalActionClick();
    }
  };

  return (
    <SimpleLayout
      footer={<FooterLogo />}
      header={<HeaderNavigation onCloseButtonClick={onCloseClick} />}
      floatHeader
    >
      <Box
        testId="status-view-container"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
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

          {optionalText ? (
            <Button
              sx={{ width: '100%', marginTop: 'base.spacing.x2' }}
              testId="status-action-button"
              variant="tertiary"
              size="large"
              onClick={onStatusOptionalActionClick}
            >
              {optionalText}
            </Button>
          ) : null}
        </Box>
      </Box>
    </SimpleLayout>
  );
}
