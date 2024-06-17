import {
  Body,
  Box,
  ButtCon,
  Button,
  Drawer,
  Heading,
  Link,
} from '@biom3/react';
import { Trans, useTranslation } from 'react-i18next';
import { WalletWarningHero } from '../../../components/Hero/WalletWarningHero';

export function NonPassportWarningDrawer({
  visible,
  onCloseDrawer,
  handleCtaButtonClick,
}: {
  visible: boolean;
  onCloseDrawer: () => void;
  handleCtaButtonClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Drawer size="full" visible={visible} showHeaderBar={false}>
      <Drawer.Content>
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
        <WalletWarningHero />
        <Box sx={{ px: 'base.spacing.x6' }}>
          <Heading
            sx={{
              marginTop: 'base.spacing.x6',
              marginBottom: 'base.spacing.x2',
              textAlign: 'center',
            }}
          >
            {t('views.CONNECT_WALLET.nonPassportDrawer.heading')}
          </Heading>
          <Body
            size="medium"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'base.color.text.body.secondary',
              marginBottom: 'base.spacing.x21',
            }}
          >
            <Trans
              i18nKey={t('views.CONNECT_WALLET.nonPassportDrawer.body1')}
              components={{
                layerswapLink: (
                  <Link
                    size="small"
                    rc={(
                      <a
                        target="_blank"
                        href="https://toolkit.immutable.com/cex-deposit"
                        rel="noreferrer"
                      />
                    )}
                  />
                ),
              }}
            />
            <br />
            <br />
            {t('views.CONNECT_WALLET.nonPassportDrawer.body2')}
          </Body>
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
            sx={{ width: '100%', marginBottom: 'base.spacing.x10' }}
            testId="non-passport-cta-button"
            variant="primary"
            size="large"
            onClick={handleCtaButtonClick}
          >
            {t('views.CONNECT_WALLET.nonPassportDrawer.buttonText')}
          </Button>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
