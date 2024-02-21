import {
  Body, Box, Button, Heading, Logo,
} from '@biom3/react';
import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';
import { getChainNameById } from 'lib/chains';
import { getWalletDisplayName, getWalletLogoByName } from 'lib/logoUtils';
import { networkIcon } from 'lib';
import {
  networkButtonStyles,
  networkIconStyles,
  walletButtonOuterStyles,
  walletCaptionStyles,
  walletLogoStyles,
} from './WalletNetworkButtonStyles';

interface WalletNetworkButtonProps {
  testId: string;
  walletName: WalletProviderName | string;
  walletAddress: string;
  chainId: ChainId;
  disableNetworkButton?: boolean;
  onWalletClick: (e) => void;
  onNetworkClick: (e) => void;
}
export function WalletNetworkButton({
  testId,
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

  return (
    <Box
      testId={`${testId}-${walletName}-${chainId}-button-wrapper`}
      sx={walletButtonOuterStyles}
      onClick={onWalletClick}
    >
      <Logo logo={walletLogo as any} sx={walletLogoStyles(walletName)} />
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
