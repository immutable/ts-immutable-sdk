import {
  Body, Box, Button, FramedImage, Heading, Logo,
} from '@biom3/react';
import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';
import { getChainNameById } from 'lib/chains';
import { getWalletDisplayName, getWalletLogoByName } from 'lib/logoUtils';
import { networkIcon } from 'lib';
import { Web3Provider } from '@ethersproject/providers';
import { WalletConnectManager } from 'lib/walletConnect';
import { useEffect, useState } from 'react';
import {
  networkButtonStyles,
  networkIconStyles,
  walletButtonOuterStyles,
  walletCaptionStyles,
  walletLogoStyles,
} from './WalletNetworkButtonStyles';

interface WalletNetworkButtonProps {
  testId: string;
  walletProvider: Web3Provider;
  walletName: WalletProviderName | string;
  walletAddress: string;
  chainId: ChainId;
  disableNetworkButton?: boolean;
  onWalletClick: (e) => void;
  onNetworkClick: (e) => void;
}
export function WalletNetworkButton({
  testId,
  walletProvider,
  walletName,
  walletAddress,
  chainId,
  disableNetworkButton = false,
  onWalletClick,
  onNetworkClick,
}: WalletNetworkButtonProps) {
  const networkName = getChainNameById(chainId);
  const walletHeading = getWalletDisplayName(walletName);
  const walletLogo = getWalletLogoByName(walletName);
  const [walletLogoUrl, setWalletLogoUrl] = useState<string | undefined>(
    undefined,
  );
  const [walletIsWalletConnect, setWalletIsWalletConnect] = useState<boolean>(false);

  useEffect(() => {
    if (WalletConnectManager.getInstance().isInitialised) {
      setWalletIsWalletConnect((walletProvider.provider as any)?.isWalletConnect);
      (async () => {
        const url = await WalletConnectManager.getInstance().getWalletLogoUrl();
        setWalletLogoUrl(url);
      })();
    }
  }, []);

  return (
    <Box
      testId={`${testId}-${walletName}-${chainId}-button-wrapper`}
      sx={walletButtonOuterStyles}
      onClick={onWalletClick}
    >
      {(walletIsWalletConnect && walletLogoUrl) ? (
        <FramedImage imageUrl={walletLogoUrl} alt="wallet connect" sx={{}} />
      ) : (
        <Logo logo={walletLogo as any} sx={walletLogoStyles(walletName)} />
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Heading size="xSmall">{walletHeading}</Heading>
        <Body size="xSmall" sx={walletCaptionStyles}>
          {walletAddress}
        </Body>
      </Box>
      <Button
        testId={`${testId}-network-${chainId}-button`}
        size="small"
        disabled={disableNetworkButton}
        onClick={(e) => {
          // stop propogation so onWalletClick is not triggered
          e.stopPropagation();
          onNetworkClick(e);
        }}
        variant="tertiary"
        sx={networkButtonStyles}
      >
        <Button.Icon
          icon={networkIcon[chainId] as any}
          sx={networkIconStyles(chainId)}
        />
        {networkName}
      </Button>
    </Box>
  );
}
