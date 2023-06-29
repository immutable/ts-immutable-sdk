import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout, GetTokenAllowListResult, TokenFilterTypes,
} from '@imtbl/checkout-sdk';

export async function getBridgeTokensAndBalances(checkout: Checkout, web3Provider: Web3Provider) {
  const network = await checkout.getNetworkInfo({
    provider: web3Provider,
  });
  const address = await web3Provider.getSigner().getAddress();
  const tokenBalances = await checkout.getAllBalances({
    provider: web3Provider,
    walletAddress: address,
    chainId: network.chainId,
  });

  const allowList: GetTokenAllowListResult = await checkout.getTokenAllowList(
    {
      chainId: network.chainId,
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
