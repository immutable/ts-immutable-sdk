import {
  Box, Button, EllipsizedText, FramedImage, Logo,
} from '@biom3/react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BridgeContext } from '../../widgets/bridge/context/BridgeContext';
import { isWalletConnectProvider } from '../../lib/provider';
import {
  UserJourney,
  useAnalytics,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { useWalletConnect } from '../../lib/hooks/useWalletConnect';
import {
  headingStyles, rawImageStyle, wcStickerLogoStyles, wcWalletLogoStyles, wcWalletLogoWrapperStyles,
} from './ChangeWalletStyles';
import { RawImage } from '../RawImage/RawImage';

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
  const walletProviderInfo = from?.walletProviderInfo;

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
      const isProviderWalletConnect = isWalletConnectProvider(from?.browserProvider);
      setIsWalletConnect(isProviderWalletConnect);
      if (isProviderWalletConnect) {
        (async () => {
          setWalletLogoUrl(await getWalletLogoUrl());
        })();
      }
    }
  }, [isWalletConnectEnabled, from]);

  return (
    <Box sx={headingStyles}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 'base.spacing.x1' }}
      >
        {(isWalletConnect && walletLogoUrl) ? (
          <Box sx={wcWalletLogoWrapperStyles}>
            <FramedImage
              sx={wcWalletLogoStyles}
              use={(
                <img
                  src={walletLogoUrl}
                  alt="walletconnect"
                />
              )}
            />
            <Logo logo="WalletConnectSymbol" sx={wcStickerLogoStyles} />
          </Box>
        ) : (walletProviderInfo && (
          <RawImage
            src={walletProviderInfo.icon}
            alt={walletProviderInfo.name}
            sx={rawImageStyle}
          />
        ))}
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
