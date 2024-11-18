// this function needs to be in a separate file to prevent circular dependencies with ./network
import { JsonRpcProvider } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { NamedBrowserProvider, WalletAction } from '../types';

const parseChainId = (chainId: unknown): number => {
  if (typeof chainId === 'number') {
    return chainId;
  }

  if (typeof chainId === 'string' && !Number.isNaN(Number(chainId))) {
    return chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId);
  }

  throw new CheckoutError(
    'Invalid chainId',
    CheckoutErrorType.WEB3_PROVIDER_ERROR,
  );
};

/**
 * Get chain id from RPC method
 * @param provider
 * @returns chainId number
 */
async function requestChainId(provider: JsonRpcProvider | NamedBrowserProvider): Promise<number> {
  if (!provider.send) {
    throw new CheckoutError(
      'Parsed provider is not a valid NamedBrowserProvider',
      CheckoutErrorType.WEB3_PROVIDER_ERROR,
    );
  }

  const chainId: string = await provider.send(WalletAction.GET_CHAINID, []);

  return parseChainId(chainId);
}

/**
 * Get the underlying chain id from the provider
 * @param provider
 * @returns chainId number
 */
export async function getUnderlyingChainId(provider: JsonRpcProvider | NamedBrowserProvider): Promise<number> {
  const { chainId } = await provider.getNetwork();

  if (chainId) {
    return parseChainId(chainId);
  }

  return requestChainId(provider);
}
