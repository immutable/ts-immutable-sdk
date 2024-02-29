import {
  Body, Box, Button, FramedImage, Heading, Logo,
} from '@biom3/react';
import { ChainId, WalletProviderRdns } from '@imtbl/checkout-sdk';
import { getChainNameById } from 'lib/chains';
import { networkIcon } from 'lib';
import { Web3Provider } from '@ethersproject/providers';
import { useContext, useEffect, useState } from 'react';
import { useWalletConnect } from 'lib/hooks/useWalletConnect';
import { isWalletConnectProvider } from 'lib/providerUtils';
import { EIP1193Provider } from 'mipd';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import {
  networkButtonStyles,
  networkIconStyles,
  walletButtonOuterStyles,
  walletCaptionStyles,
  wcStickerLogoStyles,
  wcWalletLogoStyles,
} from './WalletNetworkButtonStyles';
import { BridgeContext } from '../context/BridgeContext';
import { RawImage } from '../../../components/RawImage/RawImage';

interface WalletNetworkButtonProps {
  testId: string;
  walletProvider: Web3Provider;
  walletProviderDetail: EIP6963ProviderDetail<EIP1193Provider> | undefined;
  walletAddress: string;
  walletName: string,
  chainId: ChainId;
  disableNetworkButton?: boolean;
  onWalletClick: (e) => void;
  onNetworkClick: (e) => void;
}
export function WalletNetworkButton({
  testId,
  walletProvider,
  walletProviderDetail,
  walletAddress,
  walletName,
  chainId,
  disableNetworkButton = false,
  onWalletClick,
  onNetworkClick,
}: WalletNetworkButtonProps) {
  const networkName = getChainNameById(chainId);
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
      testId={`${testId}-${walletProviderDetail?.info.rdns}-${chainId}-button-wrapper`}
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
      ) : (walletProviderDetail && (
        <RawImage
          src={walletProviderDetail.info.icon}
          alt={walletProviderDetail.info.name}
        />
      ))}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Heading size="xSmall" sx={{ textTransform: 'capitalize' }}>
          {walletProviderDetail?.info.rdns === WalletProviderRdns.PASSPORT
            ? walletName : walletProviderDetail?.info.name}
        </Heading>
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
