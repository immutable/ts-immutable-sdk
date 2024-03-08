import {
  Body,
  Box,
  ButtCon,
  Button,
  CloudImage,
  Drawer,
  Heading,
} from '@biom3/react';
import { Checkout } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { getRemoteImage } from 'lib/utils';
import { useTranslation } from 'react-i18next';

export interface UnableToConnectDrawerProps {
  visible: boolean;
  checkout: Checkout;
  onCloseDrawer: () => void;
  onTryAgain?: () => void;
}
export function UnableToConnectDrawer({
  visible,
  checkout,
  onCloseDrawer,
  onTryAgain,
}: UnableToConnectDrawerProps) {
  const { t } = useTranslation();

  const walletErrorYellowUrl = getRemoteImage(
    checkout.config.environment ?? Environment.PRODUCTION,
    '/walleterroryellow.svg',
  );

  return (
    <Drawer
      size="threeQuarter"
      visible={visible}
      onCloseDrawer={onCloseDrawer}
      showHeaderBar={false}
    >
      <Drawer.Content
        testId="unable-to-connect-bottom-sheet"
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
            imageUrl={walletErrorYellowUrl}
            sx={{ paddingTop: 'base.spacing.x4', paddingBottom: 'base.spacing.x9' }}
          />
          <ButtCon
            icon="Close"
            variant="tertiary"
            sx={{
              pos: 'absolute',
              top: 'base.spacing.x5',
              left: 'base.spacing.x5',
              backdropFilter: 'blur(30px)',
            }}
            onClick={onCloseDrawer}
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
              size="medium"
              weight="bold"
              sx={{ textAlign: 'center', paddingX: 'base.spacing.x6' }}
            >
              {t('drawers.walletConnectionError.unableToConnect.heading')}
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
              {t('drawers.walletConnectionError.unableToConnect.body')}
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
          <Button
            size="large"
            variant="primary"
            sx={{ width: '100%', marginBottom: 'base.spacing.x10' }}
            onClick={onTryAgain}
          >
            {t(
              'drawers.walletConnectionError.unableToConnect.actionButtonText',
            )}
          </Button>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
