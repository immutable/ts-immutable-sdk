import {
  Body, Box, Button, DeeplyNestedSx, FramedImage, Heading, Logo, useTheme,
} from '@biom3/react';
import {
  ChainId, EIP6963ProviderDetail, WrappedBrowserProvider, WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import { useEffect, useMemo, useState } from 'react';
import { Environment } from '@imtbl/config';
import { getChainNameById } from '../../../lib/chains';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';
import {
  networkButtonStyles,
  walletButtonOuterStyles,
  walletCaptionStyles,
  wcStickerLogoStyles,
  wcWalletLogoStyles,
} from './WalletNetworkButtonStyles';
import { RawImage } from '../../../components/RawImage/RawImage';
import { isWalletConnectProvider } from '../../../lib/provider';
import { getChainImage } from '../../../lib/utils';

interface WalletNetworkButtonProps {
  testId: string;
  walletProvider: WrappedBrowserProvider;
  walletProviderDetail: EIP6963ProviderDetail | undefined;
  walletAddress: string;
  walletName: string,
  chainId: ChainId;
  disableNetworkButton?: boolean;
  onWalletClick: (e) => void;
  onNetworkClick: (e) => void;
  environment: Environment;
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
  environment,
}: WalletNetworkButtonProps) {
  const networkName = getChainNameById(chainId);
  const [walletLogoUrl, setWalletLogoUrl] = useState<string | undefined>(
    undefined,
  );
  const [walletConnectPeerName, setWalletConnectPeerName] = useState('Other');
  const [isWalletConnect, setIsWalletConnect] = useState<boolean>(false);
  const { isWalletConnectEnabled, getWalletLogoUrl, getWalletName } = useWalletConnect();

  const walletDisplayName = useMemo(() => {
    if (walletProviderDetail?.info.rdns === WalletProviderRdns.PASSPORT) {
      return walletName;
    }

    if (isWalletConnectProvider(walletProvider)) {
      return walletConnectPeerName;
    }

    return walletProviderDetail?.info.name;
  }, [walletProviderDetail, walletConnectPeerName, walletProvider]);

  useEffect(() => {
    if (isWalletConnectEnabled) {
      const isProviderWalletConnect = isWalletConnectProvider(walletProvider);
      setIsWalletConnect(isProviderWalletConnect);
      if (isProviderWalletConnect) {
        (async () => {
          setWalletLogoUrl(await getWalletLogoUrl());
        })();
        setWalletConnectPeerName(getWalletName());
      }
    }
  }, [isWalletConnectEnabled, walletProvider, getWalletLogoUrl, getWalletName]);
  const { base } = useTheme();

  return (
    <Box
      testId={`${testId}-${walletProviderDetail?.info.rdns}-${chainId}-button-wrapper`}
      sx={walletButtonOuterStyles as unknown as DeeplyNestedSx}
      onClick={onWalletClick}
    >
      {isWalletConnect && walletLogoUrl ? (
        <>
          <FramedImage
            imageUrl={walletLogoUrl}
            relativeImageSizeInLayout={base.icon.size[500]}
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
        <Heading size="xSmall" sx={{ textTransform: 'capitalize' }}>{walletDisplayName}</Heading>
        <Body size="xSmall" sx={walletCaptionStyles}>
          {walletAddress}
        </Body>
      </Box>
      <Button
        testId={`${testId}-network-${chainId}-button`}
        size="small"
        disabled={disableNetworkButton}
        onClick={(e) => {
          // stop propagation so onWalletClick is not triggered
          e.stopPropagation();
          onNetworkClick(e);
        }}
        variant="tertiary"
        sx={networkButtonStyles}
      >
        <Button.FramedImage
          use={(
            <img
              src={getChainImage(environment, chainId)}
              alt={networkName[chainId]}
            />
          )}
        />
        {networkName}
      </Button>
    </Box>
  );
}
