import {
  Box, Button, EllipsizedText, FramedImage, Logo,
} from '@biom3/react';
import { useContext, useEffect, useState } from 'react';
import { BridgeContext } from 'widgets/bridge/context/BridgeContext';
import { getWalletProviderNameByProvider, isWalletConnectProvider } from 'lib/providerUtils';
import {
  UserJourney,
  useAnalytics,
} from 'context/analytics-provider/SegmentAnalyticsProvider';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { useTranslation } from 'react-i18next';
import { getWalletLogoByName } from 'lib/logoUtils';
import { useWalletConnect } from 'lib/hooks/useWalletConnect';
import {
  headingStyles, wcStickerLogoStyles, wcWalletLogoStyles, wcWalletLogoWrapperStyles,
} from './ChangeWalletStyles';

export interface ChangeWalletProps {
  onChangeWalletClick: () => void;
}

export function ChangeWallet({ onChangeWalletClick }: ChangeWalletProps) {
  const { t } = useTranslation();
  const {
    bridgeState: { from },
  } = useContext(BridgeContext);
  const [walletLogoUrl, setWalletLogoUrl] = useState<string | undefined>(
    undefined,
  );
  const [isWalletConnect, setIsWalletConnect] = useState<boolean>(false);
  const { isWalletConnectEnabled, getWalletLogoUrl } = useWalletConnect();
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

  useEffect(() => {
    if (isWalletConnectEnabled) {
      setIsWalletConnect(isWalletConnectProvider(from?.web3Provider));
      (async () => {
        setWalletLogoUrl(await getWalletLogoUrl());
      })();
    }
  }, [isWalletConnectEnabled, from]);

  return (
    <Box sx={headingStyles}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 'base.spacing.x1' }}
      >
        {isWalletConnect && walletLogoUrl ? (
          <Box sx={wcWalletLogoWrapperStyles}>
            <FramedImage
              imageUrl={walletLogoUrl}
              alt="walletconnect"
              sx={wcWalletLogoStyles}
            />
            <Logo logo="WalletConnectSymbol" sx={wcStickerLogoStyles} />
          </Box>
        ) : (
          <Logo
            logo={walletLogo}
            sx={{
              width: 'base.icon.size.400',
              pr: 'base.spacing.x1',
            }}
          />
        )}
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
