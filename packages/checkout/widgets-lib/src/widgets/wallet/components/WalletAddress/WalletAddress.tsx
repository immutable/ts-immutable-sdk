import { Box, Body, Heading } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useState } from 'react';
import {
  walletAddressContainerStyle, walletAddressLayoutStyle, walletAddressTextLayoutStyle, truncatedTextStyle,
} from './WalletAddressStyles';
import { CopyButton } from './CopyButton';

export function WalletAddress({ provider }: { provider: Web3Provider | null }) {
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    if (!provider) return;

    (async () => {
      const address = await provider.getSigner().getAddress();

      setWalletAddress(address);
    })();
  }, [provider]);

  return (
    <Box sx={walletAddressContainerStyle}>
      <Box sx={walletAddressLayoutStyle}>
        <Box sx={walletAddressTextLayoutStyle}>
          <Heading size="xSmall">Wallet address</Heading>
          <Body testId="wallet-address" size="xSmall" sx={truncatedTextStyle}>{walletAddress}</Body>
        </Box>
        <CopyButton textToCopy={walletAddress} />
      </Box>
    </Box>
  );
}
