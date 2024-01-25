import { Body, Box, Button } from '@biom3/react';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { WalletDrawer } from 'widgets/bridge/components/WalletDrawer';
import { useMemo, useState } from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { containerStyle } from './EmptyStateNotConnectedStyles';

type EmptyStateNotConnectedProps = {
  checkout: Checkout,
  updateProvider: (walletProviderName: WalletProviderName) => Promise<void>,
};

export function EmptyStateNotConnected({ checkout, updateProvider }: EmptyStateNotConnectedProps) {
  const { track } = useAnalytics();
  const { t } = useTranslation();

  const [showWalletDrawer, setShowWalletDrawer] = useState(false);

  const walletOptions = useMemo(() => {
    const options = [WalletProviderName.METAMASK];
    if (checkout.passport) {
      options.push(WalletProviderName.PASSPORT);
    }
    return options;
  }, [checkout]);

  const handleProviderSelected = async (walletProviderName: WalletProviderName) => {
    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'EmptyStateNotConnected',
      control: 'WalletProvider',
      controlType: 'Select',
      extras: {
        walletProviderName,
      },
    });
    await updateProvider(walletProviderName);
  };

  const openWalletDrawer = () => setShowWalletDrawer(true);

  return (
    <>
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
      <WalletDrawer
        testId="select-wallet-drawer"
        drawerText={{
          heading: t('views.TRANSACTIONS.walletSelection.heading'),
        }}
        showWalletSelectorTarget={false}
        walletOptions={walletOptions}
        showDrawer={showWalletDrawer}
        setShowDrawer={(show: boolean) => { setShowWalletDrawer(show); }}
        onWalletItemClick={handleProviderSelected}
      />
    </>
  );
}
