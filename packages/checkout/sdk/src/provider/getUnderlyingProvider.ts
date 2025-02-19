// this function needs to be in a separate file to prevent circular dependencies with ./network
import { JsonRpcProvider } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { WrappedBrowserProvider, WalletAction } from '../types';

/**
 * Get chain id from RPC method
 * @param provider
 * @returns chainId number
 */
async function requestChainId(provider: JsonRpcProvider | WrappedBrowserProvider): Promise<bigint> {
  if (!provider.send) {
    throw new CheckoutError(
      'Parsed provider is not a valid WrappedBrowserProvider',
      CheckoutErrorType.WEB3_PROVIDER_ERROR,
    );
  }

  const chainId = await provider.send(WalletAction.GET_CHAINID, []);

  if (typeof chainId !== 'bigint') {
    throw new CheckoutError('Invalid chainId', CheckoutErrorType.WEB3_PROVIDER_ERROR);
  }

  return chainId;
}

/**
 * Get the underlying chain id from the provider
 * @param provider
 * @returns chainId number
 */
export async function getUnderlyingChainId(provider: JsonRpcProvider | WrappedBrowserProvider): Promise<bigint> {
  const network = await provider.getNetwork();

  if (network.chainId && typeof network.chainId === 'bigint') {
    return network.chainId;
  }

  return requestChainId(provider);
}
