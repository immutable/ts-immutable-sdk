import { useContext, useEffect } from 'react';
import {
  BiomePortalIdContext, Body, Box, Heading,
} from '@biom3/react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { WalletList } from '../components/WalletList';
import { ConnectContext } from '../context/ConnectContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export function ConnectWallet() {
  const portalId = useContext(BiomePortalIdContext);

  const { body } = text.views[ConnectWidgetViews.CONNECT_WALLET];
  const {
    connectState: { sendCloseEvent },
  } = useContext(ConnectContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectWallet',
    });
  }, []);

  return (
    <SimpleLayout
      testId="connect-wallet"
      header={(
        <HeaderNavigation
          onCloseButtonClick={sendCloseEvent}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        id={`connect-wallet-content${portalId}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          paddingY: 'base.spacing.x8',
          rowGap: 'base.spacing.x4',
        }}
      >
        <Heading
          size="small"
          sx={{
            paddingX: 'base.spacing.x4',
          }}
        >
          {body.heading}
        </Heading>
        <Body
          size="small"
          sx={{
            color: 'base.color.text.secondary',
            paddingX: 'base.spacing.x4',
          }}
        >
          {body.content}
        </Body>
      </Box>
      <Box sx={{ paddingX: 'base.spacing.x2' }}>
        <WalletList />
      </Box>
    </SimpleLayout>
  );
}
