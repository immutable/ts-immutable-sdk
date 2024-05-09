import { MenuItem, ButtCon } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useState } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { getWalletLogoByName } from 'lib/logoUtils';
import {
  UserJourney,
  useAnalytics,
} from '../../../../context/analytics-provider/SegmentAnalyticsProvider';

const isCopiedStyle = {
  background: 'base.color.status.success.bright',
  fill: 'base.color.status.success.bright',
};

export function WalletAddress({ provider }: { provider?: Web3Provider }) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  // const [showL1Warning, setShowL1Warning] = useState(false);

  const { track } = useAnalytics();

  const walletProviderName = () => {
    if ((provider?.provider as any)?.isMetaMask) {
      return WalletProviderName.METAMASK;
    }
    if ((provider?.provider as any)?.isPassport) {
      return WalletProviderName.PASSPORT;
    }
    return WalletProviderName.WALLETCONNECT;
  };

  const ctaIcon = () => {
    if ((provider?.provider as any)?.isMetaMask) {
      if (isCopied) {
        return 'Tick';
      }
      return 'CopyText';
    }

    return 'ShowPassword';
  };

  useEffect(() => {
    if (!provider) return;

    (async () => {
      const address = await provider.getSigner().getAddress();

      setWalletAddress(address);
    })();
  }, [provider]);

  const handleIconClick = () => {
    if (ctaIcon() === 'CopyText' && walletAddress) {
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
      }, 3000);
    } else if (ctaIcon() === 'ShowPassword') {
      setShowL1Warning(true);
    }
  };

  return (
    <MenuItem testId="wallet-address" emphasized size="medium">
      <MenuItem.FramedLogo
        logo={getWalletLogoByName(walletProviderName())}
        sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
      />

      <ButtCon
        variant="tertiary"
        iconVariant="bold"
        size="small"
        icon={ctaIcon()}
        onClick={handleIconClick}
        sx={{
          cursor: 'pointer',
          ...(isCopied ? isCopiedStyle : {}),
        }}
      />
      <MenuItem.Label>Wallet Address</MenuItem.Label>
      <MenuItem.Caption testId="wallet-address">
        {walletAddress}
      </MenuItem.Caption>
    </MenuItem>
  );
}
