// this function needs to be in a separate file to prevent circular dependencies with ./network

import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { WalletAction } from '../types';

// this gives us access to the properties of the underlying provider object
export async function getUnderlyingChainId(web3Provider:Web3Provider) {
  if (!web3Provider.provider.request) {
    throw new CheckoutError(
      'Parsed provider is not a valid Web3Provider',
      CheckoutErrorType.WEB3_PROVIDER_ERROR,
    );
  }

  const chainId = await web3Provider.provider.request({
    method: WalletAction.GET_CHAINID,
    params: [],
  });
  return parseInt(chainId, 16);
}
