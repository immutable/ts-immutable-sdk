import { BrowserProvider } from 'ethers';

interface VerifyAndSwitchChainResponse {
  isChainCorrect: boolean;
  error?: string;
}

/**
 * Ensure the provider is connected to the correct chain.
 * If not, attempts to switch to the desired chain.
 */
export const verifyAndSwitchChain = async (
  provider: BrowserProvider,
  chainId: string,
): Promise<VerifyAndSwitchChainResponse> => {
  if (!provider.send) {
    return {
      isChainCorrect: false,
      error: 'Provider does not support the request method.',
    };
  }

  try {
    const targetChainHex = `0x${parseInt(chainId, 10).toString(16)}`;
    const currentChainId = await provider.send('eth_chainId', []);

    if (targetChainHex !== currentChainId) {
      await provider.send('wallet_switchEthereumChain', [
        {
          chainId: targetChainHex,
        },
      ]);
    }
    return { isChainCorrect: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      isChainCorrect: false,
      error: errorMessage,
    };
  }
};
