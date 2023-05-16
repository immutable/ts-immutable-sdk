import { Checkout, GetAllBalancesResult } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';

export async function getAllBalances(
  checkout: Checkout,
  provider: Web3Provider,
): Promise<GetAllBalancesResult> {
  const walletAddress = await provider.getSigner().getAddress();
  const connectedChain = await provider.getNetwork();
  return await checkout.getAllBalances({
    provider,
    walletAddress,
    chainId: connectedChain.chainId,
  });
}
