import { useContext, useEffect } from 'react';
import { Body, Box, Heading } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@imtbl/checkout-sdk';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WalletList } from '../components/WalletList';
import { ConnectContext } from '../context/ConnectContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export interface ConnectWalletProps {
  targetWalletRdns?: string,
  targetChainId: ChainId;
  allowedChains: ChainId[];
  blocklistWalletRdns?: string[];
}

export function ConnectWallet({
  targetWalletRdns,
  targetChainId,
  allowedChains,
  blocklistWalletRdns,
}: ConnectWalletProps) {
  const { t } = useTranslation();
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
          {t('views.CONNECT_WALLET.body.heading')}
        </Heading>
        <Body
          size="small"
          sx={{
            color: 'base.color.text.body.secondary',
            paddingX: 'base.spacing.x4',
          }}
        >
          {t('views.CONNECT_WALLET.body.content')}
        </Body>
      </Box>
      <Box sx={{ paddingX: 'base.spacing.x2' }}>
        <WalletList
          targetWalletRdns={targetWalletRdns}
          targetChainId={targetChainId}
          allowedChains={allowedChains}
          blocklistWalletRdns={blocklistWalletRdns}
        />
      </Box>
    </SimpleLayout>
  );
}
