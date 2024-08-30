import {
  Body,
  Box,
  Button,
  CloudImage,
  Drawer,
  Heading,
} from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { useTranslation } from 'react-i18next';
import { getRemoteImage } from '../../lib/utils';

export enum WithdrawalQueueWarningType {
  TYPE_THRESHOLD = 'exceedsThreshold',
  TYPE_ACTIVE_QUEUE = 'queueActivated',
}

export interface WithdrawalQueueDrawerProps {
  visible: boolean;
  checkout: Checkout;
  onCloseDrawer: () => void;
  warningType?: WithdrawalQueueWarningType;
  onAdjustAmount?: () => void;
  threshold?: number;
}
export function WithdrawalQueueDrawer({
  visible,
  checkout,
  warningType,
  onCloseDrawer,
  onAdjustAmount,
  threshold,
}: WithdrawalQueueDrawerProps) {
  const { t } = useTranslation();

  const bridgeWarningUrl = getRemoteImage(
    checkout.config.environment ?? Environment.PRODUCTION,
    '/notenougheth.svg',
  );

  return (
    warningType && (
      <Drawer
        size={warningType === WithdrawalQueueWarningType.TYPE_THRESHOLD ? 'full' : 'threeQuarter'}
        visible={visible}
        onCloseDrawer={onCloseDrawer}
        showHeaderBar={false}
      >
        <Drawer.Content
          testId="withdraway-queue-bottom-sheet"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <CloudImage
              sx={{ paddingTop: 'base.spacing.x4', paddingBottom: 'base.spacing.x9' }}
              use={(
                <img
                  src={bridgeWarningUrl}
                  alt={t(`drawers.withdrawalQueue.${warningType}.heading`, { threshold })}
                />
              )}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'base.spacing.x4',
                paddingX: 'base.spacing.x6',
              }}
            >
              <Heading
                size="small"
                weight="bold"
                sx={{ textAlign: 'center', paddingX: 'base.spacing.x6' }}
              >
                {t(`drawers.withdrawalQueue.${warningType}.heading`, { threshold })}
              </Heading>

              <Body
                size="medium"
                weight="regular"
                sx={{
                  color: 'base.color.text.body.secondary',
                  textAlign: 'center',
                  paddingX: 'base.spacing.x6',
                }}
              >
                {t(`drawers.withdrawalQueue.${warningType}.body`, { threshold })}
              </Body>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              paddingX: 'base.spacing.x6',
              width: '100%',
            }}
          >
            {warningType === WithdrawalQueueWarningType.TYPE_THRESHOLD && (
              <Button
                size="large"
                variant="primary"
                sx={{ width: '100%', marginBottom: 'base.spacing.x5' }}
                onClick={onAdjustAmount}
              >
                {t('drawers.withdrawalQueue.exceedsThreshold.buttons.cancel')}
              </Button>
            )}

            <Button
              size="large"
              variant="primary"
              sx={{ width: '100%', marginBottom: 'base.spacing.x10' }}
              onClick={onCloseDrawer}
            >
              {t(`drawers.withdrawalQueue.${warningType}.buttons.proceed`)}
            </Button>
          </Box>
        </Drawer.Content>
      </Drawer>
    )
  );
}
