import { Body, Box } from '@biom3/react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/ConnectViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { WalletList } from '../components/WalletList';
import { closeConnectWidget } from '../functions/closeConnectWidget';

export const ConnectWallet = () => {
  const { header, body } = text.views[ConnectWidgetViews.CONNECT_WALLET];

  return (
    <SimpleLayout
      testId="connect-wallet"
      header={<HeaderNavigation title={header.title} showClose onCloseButtonClick={closeConnectWidget} />}
      footer={<FooterLogo />}
    >
      <Box
        id="connect-wallet-content"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          rowGap: 'base.spacing.x9',
        }}
      >
        <Body
          size="small"
          sx={{
            color: 'base.color.text.secondary',
            paddingX: 'base.spacing.x2',
          }}
        >
          {body.content}
        </Body>
        <WalletList />
      </Box>
    </SimpleLayout>
  );
};
