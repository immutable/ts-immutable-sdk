import { Box, Button } from '@biom3/react';
import { useContext, useEffect } from 'react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { sendDisconnectWalletEvent, sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import { WalletAddress } from '../components/WalletAddress/WalletAddress';
import { settingsBoxStyle, settingsDisconnectButtonStyle } from './SettingsStyles';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../lib/providerUtils';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { UserJourney } from '../../../context/analytics-provider/segmentAnalyticsConfig';
import { useAnalytics } from '../../../context/analytics-provider/CustomAnalyticsProvider';

export function Settings() {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { provider } = connectLoaderState;
  const { header, disconnectButton } = text.views[WalletWidgetViews.SETTINGS];
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const isPassport = isPassportProvider(provider);

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
          title={header.title}
          onCloseButtonClick={() => sendWalletWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        sx={settingsBoxStyle}
      >
        <WalletAddress provider={provider} />
        {isPassport && (
        <Button
          testId="disconnect-button"
          variant="secondary"
          sx={settingsDisconnectButtonStyle}
          onClick={() => sendDisconnectWalletEvent(eventTarget)}
        >
          {disconnectButton.label}
        </Button>
        )}
      </Box>
    </SimpleLayout>
  );
}
