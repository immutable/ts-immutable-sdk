import {
  Body, Box, Button, Drawer, Heading,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { WalletWarningHero } from '../../../components/Hero/WalletWarningHero';

export interface AddressMissmatchDrawerProps {
  visible: boolean;
  onClick: () => void;
}

export function AddressMissmatchDrawer({
  visible,
  onClick,
}: AddressMissmatchDrawerProps) {
  const { t } = useTranslation();
  return (
    <Drawer size="full" visible={visible} showHeaderBar={false}>
      <Drawer.Content>
        <WalletWarningHero />
        <Box sx={{ px: 'base.spacing.x6' }}>
          <Heading
            sx={{
              marginTop: 'base.spacing.x6',
              marginBottom: 'base.spacing.x2',
              textAlign: 'center',
            }}
          >
            {t('views.ADD_TOKENS.error.addressMismatch.heading')}
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
            {t('views.ADD_TOKENS.error.addressMismatch.body')}
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
            onClick={onClick}
          >
            {t('views.ADD_TOKENS.error.addressMismatch.buttonText')}
          </Button>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
