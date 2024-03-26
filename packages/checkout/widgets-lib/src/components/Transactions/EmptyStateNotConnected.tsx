import { Body, Box, Button } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { containerStyle } from './EmptyStateNotConnectedStyles';

type EmptyStateNotConnectedProps = {
  openWalletDrawer: () => void
};

export function EmptyStateNotConnected({ openWalletDrawer }: EmptyStateNotConnectedProps) {
  const { t } = useTranslation();

  return (
    <Box sx={containerStyle}>
      <Body sx={{ mb: 'base.spacing.x8' }}>{t('views.TRANSACTIONS.status.emptyState.notConnected.body')}</Body>
      <Button
        variant="secondary"
        size="medium"
        testId="transactions-connect-wallet-button"
        onClick={openWalletDrawer}
      >
        {t('views.TRANSACTIONS.status.emptyState.notConnected.buttonText')}
      </Button>
    </Box>
  );
}
