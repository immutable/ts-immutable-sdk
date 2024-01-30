import {
  Box, Button, Divider, EllipsizedText, Logo,
} from '@biom3/react';
import { useContext } from 'react';
import { BridgeContext } from 'widgets/bridge/context/BridgeContext';
import { isMetaMaskProvider, isPassportProvider } from 'lib/providerUtils';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { useTranslation } from 'react-i18next';
import { headingStyles } from './ChangeWalletStyles';

export interface ChangeWalletProps {
  onChangeWalletClick: () => void;
}

export function ChangeWallet({
  onChangeWalletClick,
}: ChangeWalletProps) {
  const { t } = useTranslation();
  const { bridgeState: { from } } = useContext(BridgeContext);
  const { track } = useAnalytics();
  const walletAddress = from?.walletAddress || '';
  const isMetaMask = isMetaMaskProvider(from?.web3Provider);
  const isPassport = isPassportProvider(from?.web3Provider);

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
    <>
      <Box sx={headingStyles}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 'base.spacing.x1' }}>
          {isMetaMask && !isPassport && <Logo logo="MetaMaskSymbol" sx={{ width: 'base.icon.size.400' }} />}
          {!isMetaMask && isPassport && (
            <Logo
              logo="PassportSymbolOutlined"
              sx={
                {
                  width: 'base.icon.size.400',
                  pr: 'base.spacing.x1',
                }
              }
            />
          )}
          <EllipsizedText leftSideLength={6} rightSideLength={4} text={walletAddress} />
        </Box>
        <Button size="small" variant="secondary" onClick={handleChangeWalletClick}>
          {t('views.TRANSACTIONS.changeWallet.buttonText')}
        </Button>
      </Box>
      <Divider
        size="small"
        sx={{
          pb: 'base.spacing.x2',
          color: 'base.color.translucent.emphasis.300',
          opacity: 0.1,
        }}
      />
    </>
  );
}
