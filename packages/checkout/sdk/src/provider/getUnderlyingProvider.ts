// this function needs to be in a separate file to prevent circular dependencies with ./network

import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { WalletAction } from '../types';

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
 * @param web3Provider
 * @returns chainId number
 */
async function requestChainId(web3Provider: Web3Provider): Promise<number> {
  if (!web3Provider.provider?.request) {
    throw new CheckoutError(
      'Parsed provider is not a valid Web3Provider',
      CheckoutErrorType.WEB3_PROVIDER_ERROR,
    );
  }

  const chainId: string = await web3Provider.provider.request({
    method: WalletAction.GET_CHAINID,
    params: [],
  });

  return parseChainId(chainId);
}

/**
 * Get the underlying chain id from the provider
 * @param web3Provider
 * @returns chainId number
 */
export async function getUnderlyingChainId(web3Provider: Web3Provider): Promise<number> {
  const chainId = (web3Provider.provider as any)?.chainId;

  if (chainId) {
    return parseChainId(chainId);
  }

  return requestChainId(web3Provider);
}
