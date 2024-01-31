import { Box, Button } from '@biom3/react';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { provider } = connectLoaderState;
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.WALLET,
      screen: 'Settings',
    });
  }, []);

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
          onClick={() => sendDisconnectWalletEvent(eventTarget)}
        >
          {t('views.SETTINGS.disconnectButton.label')}
        </Button>
      </Box>
    </SimpleLayout>
  );
}
