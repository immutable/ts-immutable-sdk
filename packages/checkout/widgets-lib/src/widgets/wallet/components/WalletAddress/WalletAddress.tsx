import { MenuItem, ButtCon } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useMemo, useState } from 'react';
import { getWalletLogoByName } from 'lib/logoUtils';
import { useTranslation } from 'react-i18next';
import { abbreviateWalletAddress } from 'lib/utils';
import { getWalletProviderNameByProvider } from 'lib/provider';
import {
  UserJourney,
  useAnalytics,
} from '../../../../context/analytics-provider/SegmentAnalyticsProvider';

const isCopiedStyle = {
  background: 'base.color.status.success.bright',
  fill: 'base.color.status.success.bright',
};

export function WalletAddress({
  provider,
  showL1Warning,
  setShowL1Warning,
}: {
  provider?: Web3Provider;
  showL1Warning: boolean;
  setShowL1Warning: (show: boolean) => void;
}) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const { t } = useTranslation();

  const { track } = useAnalytics();

  const ctaIcon = useMemo(() => {
    if ((provider?.provider as any)?.isPassport && !showL1Warning) {
      return 'ShowPassword';
    }
    return isCopied ? 'Tick' : 'CopyText';
  }, [provider, showL1Warning, isCopied]);

  useEffect(() => {
    if (!provider) return;

    (async () => {
      const address = await provider.getSigner().getAddress();

      setWalletAddress(address);
    })();
  }, [provider]);

  const handleIconClick = () => {
    const icon = ctaIcon;
    if (walletAddress && icon === 'CopyText') {
      track({
        userJourney: UserJourney.WALLET,
        screen: 'Settings',
        control: 'CopyWalletAddress',
        controlType: 'Button',
      });
      navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } else if (icon === 'ShowPassword') {
      setShowL1Warning(true);
    }
  };

  return (
    <MenuItem testId="wallet-address" emphasized size="medium">
      <MenuItem.FramedLogo
        logo={getWalletLogoByName(getWalletProviderNameByProvider(provider))}
        sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
      />

      <ButtCon
        variant="tertiary"
        iconVariant="bold"
        size="small"
        icon={ctaIcon}
        onClick={handleIconClick}
        sx={{
          cursor: 'pointer',
          ...(isCopied ? isCopiedStyle : {}),
        }}
      />
      <MenuItem.Label>{t('views.SETTINGS.walletAddress.label')}</MenuItem.Label>
      <MenuItem.Caption testId="wallet-address">
        {abbreviateWalletAddress(walletAddress)}
      </MenuItem.Caption>
    </MenuItem>
  );
}
