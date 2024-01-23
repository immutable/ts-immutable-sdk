import { Body, Box, Button } from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { WalletDrawer } from 'widgets/bridge/components/WalletDrawer';
import { useMemo, useState } from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { containerStyle } from './EmptyStateNotConnectedStyles';

type EmptyStateNotConnectedProps = {
  checkout: Checkout,
  updateProvider: (walletProviderName: WalletProviderName) => Promise<void>,
};

export function EmptyStateNotConnected({ checkout, updateProvider }: EmptyStateNotConnectedProps) {
  const { track } = useAnalytics();

  const {
    status: { emptyState },
    walletSelection: { heading },
  } = text.views[BridgeWidgetViews.TRANSACTIONS];

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
        <Body sx={{ mb: 'base.spacing.x8' }}>{emptyState.notConnected.body}</Body>
        <Button
          variant="secondary"
          size="medium"
          testId="transactions-connect-wallet-button"
          onClick={openWalletDrawer}
        >
          Connect

        </Button>
      </Box>
      <WalletDrawer
        testId="select-wallet-drawer"
        drawerText={{
          heading,
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
