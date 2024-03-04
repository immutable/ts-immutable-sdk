import { Box, Button } from '@biom3/react';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWalletConnect } from 'lib/hooks/useWalletConnect';
import { isWalletConnectProvider } from 'lib/providerUtils';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { sendDisconnectWalletEvent, sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import { WalletAddress } from '../components/WalletAddress/WalletAddress';
import { settingsBoxStyle, settingsDisconnectButtonStyle } from './SettingsStyles';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export interface SettingsProps {
  showDisconnectButton: boolean;
}

export function Settings({
  showDisconnectButton,
}: SettingsProps) {
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

  // disconnect all Wallet Connect pairings and disconnect the provider
  // so that restoreSession doesn't pick up the previous sessions
  const handleWCDisconnect = async () => {
    if (isWalletConnectProvider(provider)) {
      try {
        if ((provider!.provider as any)?.session) {
          const pairings = (provider!.provider as any)?.signer.client.core.pairing.getPairings();
          if (pairings && pairings.length > 0) {
            // eslint-disable-next-line max-len
            const pairingsToDisconnect = pairings.map((pairing) => ethereumProvider?.signer.client.core.pairing.disconnect({ topic: pairing.topic }));
            await Promise.allSettled(pairingsToDisconnect);
          }
          await (provider!.provider as any).disconnect();
          return;
        }

        if (ethereumProvider) {
          const pairings = ethereumProvider?.signer.client.core.pairing.getPairings();
          if (pairings && pairings.length > 0) {
            // eslint-disable-next-line max-len
            const pairingsToDisconnect = pairings.map((pairing) => ethereumProvider?.signer.client.core.pairing.disconnect({ topic: pairing.topic }));
            await Promise.allSettled(pairingsToDisconnect);
          }
          await ethereumProvider.disconnect();
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
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
        {showDisconnectButton && (
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
        )}
      </Box>
    </SimpleLayout>
  );
}
