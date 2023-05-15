import { Box, Body } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useState } from 'react';
import { WalletAddressContainerStyle, WalletAddressLayoutStyle, WalletAddressTextLayoutStyle, TruncatedTextStyle } from './WalletAddressStyles';
import { CopyButton } from './CopyButton';

export const WalletAddress = ({ provider }: { provider: Web3Provider | null }) => {
  const [walletAddress, setWalletAddress] = useState<string>('')

  useEffect(() => {
    if (!provider) return;

    (async () => {
      const address = await provider.getSigner().getAddress();

      setWalletAddress(address)
    })();
  }, [provider]);

  return (
    <Box sx={WalletAddressContainerStyle}>
      <Box sx={WalletAddressLayoutStyle}>
        <Box sx={WalletAddressTextLayoutStyle}>
          <Body size="xSmall" sx={{color: 'base.color.brand.4'}}>Wallet address</Body>
          <Body size="medium" sx={TruncatedTextStyle}>{walletAddress}</Body>
        </Box>
        <CopyButton textToCopy={walletAddress} />
      </Box>
    </Box>
  );
};
