import { Web3Provider } from '@ethersproject/providers';

interface VerifyAndSwitchChainResponse {
  isChainCorrect: boolean;
  error?: string;
}

/**
 * Ensure the provider is connected to the correct chain.
 * If not, attempts to switch to the desired chain.
 */
export const verifyAndSwitchChain = async (
  provider: Web3Provider,
  chainId: string,
): Promise<VerifyAndSwitchChainResponse> => {
  if (!provider.provider.request) {
    return {
      isChainCorrect: false,
      error: 'Provider does not support the request method.',
    };
  }

  try {
    const targetChainHex = `0x${parseInt(chainId, 10).toString(16)}`;
    const currentChainId = await provider.provider.request({
      method: 'eth_chainId',
    });

    if (targetChainHex !== currentChainId) {
      await provider.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: targetChainHex,
          },
        ],
      });
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
