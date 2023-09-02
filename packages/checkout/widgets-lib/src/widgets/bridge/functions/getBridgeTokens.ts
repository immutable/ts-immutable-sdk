import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  GetTokenAllowListResult,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import { retry } from '../../../lib/retry';
import { DEFAULT_BALANCE_RETRY_POLICY } from '../../../lib';

export async function getBridgeTokensAndBalances(
  checkout: Checkout,
  provider: Web3Provider,
) {
  if (!checkout || !provider) return {};

  const { chainId } = await checkout.getNetworkInfo({ provider });
  const walletAddress = await provider.getSigner().getAddress();
  const tokenBalances = await retry(
    () => checkout.getAllBalances({
      provider,
      walletAddress,
      chainId,
    }),
    DEFAULT_BALANCE_RETRY_POLICY,
  );

  const allowList: GetTokenAllowListResult = await checkout.getTokenAllowList(
    {
      chainId,
      type: TokenFilterTypes.BRIDGE,
    },
  );

  // allow ETH in tokenBalances even if 0 balance so we can check for
  // enough funds for gas
  const allowedTokenBalances = tokenBalances.balances
    .filter((balance) => (balance.balance.gt(0) || (!balance.token.address || balance.token.address === 'NATIVE'))
         && allowList.tokens
           .map((token) => token.address)
           .includes(balance.token.address));

  return {
    allowList,
    allowedTokenBalances,
  };
}
