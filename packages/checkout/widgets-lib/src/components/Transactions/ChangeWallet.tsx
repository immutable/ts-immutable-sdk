import {
  Box, Button, EllipsizedText, Logo,
} from '@biom3/react';
import { useContext } from 'react';
import { BridgeContext } from 'widgets/bridge/context/BridgeContext';
import { getWalletProviderNameByProvider } from 'lib/providerUtils';
import {
  UserJourney,
  useAnalytics,
} from 'context/analytics-provider/SegmentAnalyticsProvider';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { useTranslation } from 'react-i18next';
import { getWalletLogoByName } from 'lib/logoUtils';
import { headingStyles } from './ChangeWalletStyles';

export interface ChangeWalletProps {
  onChangeWalletClick: () => void;
}

export function ChangeWallet({ onChangeWalletClick }: ChangeWalletProps) {
  const { t } = useTranslation();
  const {
    bridgeState: { from },
  } = useContext(BridgeContext);
  const { track } = useAnalytics();
  const walletAddress = from?.walletAddress || '';

  const walletLogo = getWalletLogoByName(
    getWalletProviderNameByProvider(from?.web3Provider),
  );

  const handleChangeWalletClick = () => {
    track({
      userJourney: UserJourney.BRIDGE,
      screen: BridgeWidgetViews.TRANSACTIONS,
      controlType: 'Button',
      control: 'Pressed',
    });
    onChangeWalletClick();
  };

  return (
    <Box sx={headingStyles}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 'base.spacing.x1' }}
      >
        <Logo
          logo={walletLogo}
          sx={{
            width: 'base.icon.size.400',
            pr: 'base.spacing.x1',
          }}
        />
        <EllipsizedText
          leftSideLength={6}
          rightSideLength={4}
          text={walletAddress}
        />
      </Box>
      <Button size="small" variant="tertiary" onClick={handleChangeWalletClick}>
        {t('views.TRANSACTIONS.changeWallet.buttonText')}
      </Button>
    </Box>
  );
}
