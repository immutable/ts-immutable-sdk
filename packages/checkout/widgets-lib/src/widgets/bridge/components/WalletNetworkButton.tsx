import {
  Body, Box, Button, FramedImage, Heading, Logo,
} from '@biom3/react';
import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';
import { getChainNameById } from 'lib/chains';
import { getWalletDisplayName, getWalletLogoByName } from 'lib/logoUtils';
import { networkIcon } from 'lib';
import { Web3Provider } from '@ethersproject/providers';
import { useContext, useEffect, useState } from 'react';
import { useWalletConnect } from 'lib/hooks/useWalletConnect';
import { isWalletConnectProvider } from 'lib/providerUtils';
import {
  networkButtonStyles,
  networkIconStyles,
  walletButtonOuterStyles,
  walletCaptionStyles,
  walletLogoStyles,
  wcStickerLogoStyles,
  wcWalletLogoStyles,
} from './WalletNetworkButtonStyles';
import { BridgeContext } from '../context/BridgeContext';

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
  const [isWalletConnect, setIsWalletConnect] = useState<boolean>(false);
  const {
    bridgeState: { checkout },
  } = useContext(BridgeContext);
  const { isWalletConnectEnabled, getWalletLogoUrl } = useWalletConnect({
    checkout,
  });

  useEffect(() => {
    if (isWalletConnectEnabled) {
      setIsWalletConnect(isWalletConnectProvider(walletProvider));
      (async () => {
        setWalletLogoUrl(await getWalletLogoUrl());
      })();
    }
  }, [isWalletConnectEnabled, walletProvider]);

  return (
    <Box
      testId={`${testId}-${walletName}-${chainId}-button-wrapper`}
      sx={walletButtonOuterStyles}
      onClick={onWalletClick}
    >
      {isWalletConnect && walletLogoUrl ? (
        <>
          <FramedImage
            imageUrl={walletLogoUrl}
            alt="walletconnect"
            sx={wcWalletLogoStyles}
          />
          <Logo logo="WalletConnectSymbol" sx={wcStickerLogoStyles} />
        </>
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
