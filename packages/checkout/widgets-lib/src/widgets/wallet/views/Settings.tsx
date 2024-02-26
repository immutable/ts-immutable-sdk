import { Box, Button } from '@biom3/react';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWalletConnect } from 'lib/hooks/useWalletConnect';
import { isMetaMaskProvider, isPassportProvider, isWalletConnectProvider } from 'lib/providerUtils';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { sendDisconnectWalletEvent, sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import { WalletAddress } from '../components/WalletAddress/WalletAddress';
import { settingsBoxStyle, settingsDisconnectButtonStyle } from './SettingsStyles';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export function Settings() {
  const { t } = useTranslation();
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { ethereumProvider } = useWalletConnect({ checkout: checkout! });

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.WALLET,
      screen: 'Settings',
    });
  }, []);

  const handleWCDisconnect = async () => {
    if (isPassportProvider(provider)) {
      console.log('disconnecting passport provider by calling logout on Passport');
      await checkout?.passport?.logout();
      console.log('disconnected');
      return;
    }

    if (isMetaMaskProvider(provider)) {
      console.log('disconnecting MetaMask provider by revoking permissions');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      await (provider?.provider as any).request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] });
      console.log('disconnected');
      return;
    }

    if (isWalletConnectProvider(provider)) {
      console.log('disconnecting WalletConnect by disconnecting all pairings and then provider disconnect');
      if (ethereumProvider?.session) {
        const pairings = ethereumProvider?.signer.client.core.pairing.getPairings();
        console.log('pairings', pairings);
        // eslint-disable-next-line max-len
        const pairingsToDisconnect = pairings.map((pairing) => ethereumProvider?.signer.client.core.pairing.disconnect({ topic: pairing.topic }));
        await Promise.allSettled(pairingsToDisconnect);
        await ethereumProvider.disconnect();
        console.log('disconnected');
      }
    }
  };

  return (
    <SimpleLayout
      testId="wallet-balances"
      header={(
        <HeaderNavigation
          showBack
          title={t('views.SETTINGS.header.title')}
          onCloseButtonClick={() => sendWalletWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        sx={settingsBoxStyle}
      >
        <WalletAddress provider={provider} />
        <Button
          testId="disconnect-button"
          variant="secondary"
          sx={settingsDisconnectButtonStyle}
          onClick={() => {
            handleWCDisconnect();
            sendDisconnectWalletEvent(eventTarget);
          }}
        >
          {t('views.SETTINGS.disconnectButton.label')}
        </Button>
      </Box>
    </SimpleLayout>
  );
}
