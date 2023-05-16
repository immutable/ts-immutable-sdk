import { Box, Button } from '@biom3/react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import { sendDisconnectWalletEvent, sendWalletWidgetCloseEvent } from '../WalletWidgetEvents';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import { WalletAddress } from '../components/WalletAddress/WalletAddress';

export const Settings = () => {
  const { walletState } = useContext(WalletContext);
  const { header, disconnectButton } = text.views[WalletWidgetViews.SETTINGS];
  const { provider } = walletState;

  return (
    <SimpleLayout
      testId="wallet-balances"
      header={
        <HeaderNavigation
          showBack
          title={header.title}
          onCloseButtonClick={sendWalletWidgetCloseEvent}
        />
      }
      footer={<FooterLogo />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: 'base.spacing.x2',
          marginX: 'base.spacing.x2'
        }}
      >
        <WalletAddress provider={provider}/>
        <Button testId="disconnect-button" variant="secondary" sx={{marginTop: "32px"}} onClick={sendDisconnectWalletEvent}>{disconnectButton.label}</Button>
      </Box>
    </SimpleLayout>
  );
};
