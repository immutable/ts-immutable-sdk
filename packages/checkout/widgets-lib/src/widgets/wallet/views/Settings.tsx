import { Box, Button } from '@biom3/react';
import { useContext } from 'react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { sendDisconnectWalletEvent, sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import { WalletAddress } from '../components/WalletAddress/WalletAddress';
import { settingsBoxStyle, settingsDisconnectButtonStyle } from './SettingsStyles';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';

export function Settings() {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { provider } = connectLoaderState;
  const { header, disconnectButton } = text.views[WalletWidgetViews.SETTINGS];

  return (
    <SimpleLayout
      testId="wallet-balances"
      header={(
        <HeaderNavigation
          showBack
          title={header.title}
          onCloseButtonClick={sendWalletWidgetCloseEvent}
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
          onClick={sendDisconnectWalletEvent}
        >
          {disconnectButton.label}
        </Button>
      </Box>
    </SimpleLayout>
  );
}
