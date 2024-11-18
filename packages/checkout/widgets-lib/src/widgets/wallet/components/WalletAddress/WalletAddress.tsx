import {
  type AllDualVariantIconKeys, type AllIconKeys, ButtCon,
  isDualVariantIcon,
  MenuItem, type SxProps,
} from '@biom3/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NamedBrowserProvider } from '@imtbl/checkout-sdk';
import {
  UserJourney,
  useAnalytics,
} from '../../../../context/analytics-provider/SegmentAnalyticsProvider';
import { getWalletLogoByName } from '../../../../lib/logoUtils';
import { isPassportProvider } from '../../../../lib/provider';
import { abbreviateWalletAddress } from '../../../../lib/utils';

const isCopiedStyle: SxProps = {
  background: 'base.color.status.success.bright',
  fill: 'base.color.status.success.bright',
};

const isCopiedIconStyle: SxProps = {
  fill: 'base.color.fixed.black.1000',
};

export function WalletAddress({
  provider,
  showL1Warning,
  setShowL1Warning,
}: {
  provider?: NamedBrowserProvider;
  showL1Warning: boolean;
  setShowL1Warning: (show: boolean) => void;
}) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const { t } = useTranslation();

  const { track } = useAnalytics();

  const ctaIcon = useMemo<AllIconKeys>(() => {
    if (isPassportProvider(provider?.name) && !showL1Warning) {
      return 'ShowPassword';
    }
    return isCopied ? 'Tick' : 'CopyText';
  }, [provider, showL1Warning, isCopied]);

  useEffect(() => {
    if (!provider || walletAddress !== '') return;

    (async () => {
      const address = await (await provider.getSigner()).getAddress();
      setWalletAddress(address);
    })();
  }, [provider, walletAddress]);

  const handleIconClick = async () => {
    if (walletAddress && ctaIcon === 'CopyText') {
      track({
        userJourney: UserJourney.WALLET,
        screen: 'Settings',
        control: 'CopyWalletAddress',
        controlType: 'Button',
      });
      navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } else if (ctaIcon === 'ShowPassword') {
      setShowL1Warning(true);
    }
  };

  return (
    <MenuItem testId="wallet-address" emphasized size="medium">
      <MenuItem.FramedLogo
        logo={getWalletLogoByName(provider?.name ?? 'Other')}
        sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
      />
      {isDualVariantIcon(ctaIcon) ? (
        <ButtCon
          variant="tertiary"
          iconVariant="bold"
          size="small"
          icon={ctaIcon}
          iconSx={{
            ...(isCopied ? isCopiedIconStyle : {}),
          }}
          onClick={handleIconClick}
          sx={{
            cursor: 'pointer',
            ...(isCopied ? isCopiedStyle : {}),
          }}
        />
      ) : (
        <ButtCon
          variant="tertiary"
          size="small"
          icon={ctaIcon as AllDualVariantIconKeys}
          iconSx={{
            ...(isCopied ? isCopiedIconStyle : {}),
          }}
          onClick={handleIconClick}
          sx={{
            cursor: 'pointer',
            ...(isCopied ? isCopiedStyle : {}),
          }}
        />
      )}

      <MenuItem.Label>{t('views.SETTINGS.walletAddress.label')}</MenuItem.Label>
      <MenuItem.Caption testId="wallet-address">
        {abbreviateWalletAddress(walletAddress)}
      </MenuItem.Caption>
    </MenuItem>
  );
}
