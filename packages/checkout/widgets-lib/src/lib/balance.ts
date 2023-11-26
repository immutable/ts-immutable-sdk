import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  Checkout,
  GetBalanceResult,
  GetTokenAllowListResult,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import { RetryType, retry } from './retry';
import { DEFAULT_BALANCE_RETRY_POLICY, NATIVE } from './constants';

export type GetAllowedBalancesParamsType = {
  checkout: Checkout,
  provider: Web3Provider,
  allowTokenListType: TokenFilterTypes,
  allowZero?: boolean,
  retryPolicy?: RetryType,
  chainId?: ChainId
};

export type GetAllowedBalancesResultType = {
  allowList: GetTokenAllowListResult
  allowedBalances: GetBalanceResult[]
};

export const getAllowedBalances = async ({
  checkout,
  provider,
  allowTokenListType,
  chainId,
  allowZero = false,
  retryPolicy = DEFAULT_BALANCE_RETRY_POLICY,
}: GetAllowedBalancesParamsType):Promise<GetAllowedBalancesResultType> => {
  const currentChainId = chainId || (await checkout.getNetworkInfo({ provider })).chainId;

  const walletAddress = await provider.getSigner().getAddress();
  const tokenBalances = await retry(
    () => checkout.getAllBalances({
      provider,
      walletAddress,
      chainId: currentChainId,
    }),
    { ...retryPolicy },
  );

  const allowList = await checkout.getTokenAllowList({
    chainId: currentChainId,
    type: allowTokenListType,
  });

  const tokensAddresses = new Map();
  allowList.tokens.forEach((token) => tokensAddresses.set(token.address || NATIVE, true));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const allowedBalances = tokenBalances?.balances.filter((balance) => {
    // Balance is <= 0 and it is not allow to have zeros
    if (balance.balance.lte(0) && !allowZero) return false;

    return tokensAddresses.get(balance.token.address || NATIVE);
  }) ?? [];

  // todo: revert back to using allowedBalances above, setting to all balances
  // while bridge allowedlist config is empty array
  // eslint-disable-next-line no-console
  console.log('User balances:', tokenBalances?.balances);
  return { allowList, allowedBalances: tokenBalances?.balances || [] };
};
