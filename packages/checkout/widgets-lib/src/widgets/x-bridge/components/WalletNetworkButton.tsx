import {
  Body,
  Box,
  Button,
  Heading,
  Logo,
} from '@biom3/react';
import { ChainId, ChainName, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  networkButtonStyles,
  networkIconStyles,
  walletButtonOuterStyles,
  walletCaptionStyles,
  walletLogoStyles,
} from './WalletNetworkButtonStyles';

const networkIcon = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
  [ChainId.ETHEREUM]: 'EthToken',
  [ChainId.SEPOLIA]: 'EthToken',
};

const walletLogo = {
  [WalletProviderName.PASSPORT]: 'PassportSymbolOutlined',
  [WalletProviderName.METAMASK]: 'MetaMaskSymbol',
};

interface WalletNetworkButtonProps {
  testId: string;
  walletName: WalletProviderName;
  walletAddress: string;
  chainId: ChainId;
  onWalletClick: (e) => void;
  onNetworkClick: (e) => void;
}
export function WalletNetworkButton({
  testId,
  walletName,
  walletAddress,
  chainId,
  onWalletClick,
  onNetworkClick,
}: WalletNetworkButtonProps) {
  // need to support multiple environments/networks
  const networkName = ChainId.SEPOLIA === chainId ? ChainName.SEPOLIA : ChainName.IMTBL_ZKEVM_TESTNET;
  const walletHeading = walletName === WalletProviderName.METAMASK ? 'Metamask' : 'Passport';

  return (
    <Box
      testId={`${testId}-${walletName}-${chainId}-button-wrapper`}
      sx={walletButtonOuterStyles}
      onClick={onWalletClick}
    >
      <Logo
        logo={walletLogo[walletName] as any}
        sx={walletLogoStyles}
      />
      <Box sx={{
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
        size="small"
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
