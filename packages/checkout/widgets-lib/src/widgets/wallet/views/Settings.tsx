import { Box, Button } from '@biom3/react';
import { useContext } from 'react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { WalletContext } from '../context/WalletContext';
import { sendDisconnectWalletEvent, sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import { WalletAddress } from '../components/WalletAddress/WalletAddress';
import { settingsBoxStyle, settingsDisconnectButtonStyle } from './SettingsStyles';

export function Settings() {
  const { walletState } = useContext(WalletContext);
  const { header, disconnectButton } = text.views[WalletWidgetViews.SETTINGS];
  const { provider } = walletState;

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
