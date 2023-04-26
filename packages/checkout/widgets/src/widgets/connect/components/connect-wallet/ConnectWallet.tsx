import { Body, Box } from '@biom3/react';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { WalletList } from '../wallet-list/WalletList';

const connectWalletContent = "You’ll need to connect or create a digital wallet to buy, sell, trade and store your coins and collectibles."
export const ConnectWallet = () => {
  return (
    <SimpleLayout
      testId='connect-wallet'
      header={<HeaderNavigation title="Connect a wallet" showClose />}
      footer={<FooterLogo />}
    >
      <Box id="connect-wallet-content" sx={{display: 'flex', flexDirection: 'column', paddingX: 'base.spacing.x2', rowGap: 'base.spacing.x9'}}>
        <Body size="small" sx={{color: 'base.color.text.secondary', paddingX: 'base.spacing.x2'}}>{connectWalletContent}</Body>
        <WalletList />
      </Box>
    </SimpleLayout>
  );
};
