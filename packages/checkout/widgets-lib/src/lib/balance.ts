import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  Checkout,
  GetBalanceResult,
  GetTokenAllowListResult,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
// import { Environment } from '@imtbl/config';
// import { isNativeToken } from '@imtbl/checkout-sdk/dist/tokens';
// import { getTokenImageByAddress } from '@imtbl/checkout-sdk/dist/balances';
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
}: GetAllowedBalancesParamsType): Promise<GetAllowedBalancesResultType | undefined> => {
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

  // Why is this needed?
  // getAllowedBalances has a retry logic, if the user changes network
  // the retry holds the ref to the old provider causing an error due
  // to the mismatch of chain id between what's held by the retry and
  // what's currently set in the latest provider.
  // Due to this error, the POLICY automatically returns undefined
  // and this is backfilled with an empty object making the application
  // believe that the wallet has no tokens.
  // This is now handled in the Bridge and Swap widget.
  if (tokenBalances === undefined) return undefined;

  const allowList = await checkout.getTokenAllowList({
    chainId: currentChainId,
    type: allowTokenListType,
  });
  // TODO: Map token icon to allow list
  // allowList.tokens = allowList.tokens.map((token) => ({
  //   ...token,
  //   icon: getTokenImageByAddress(checkout.config.environment as Environment, (isNativeToken(token.address)
  //     ? token.symbol.toLowerCase() : token.address as string)),
  // }));

  const tokensAddresses = new Map();
  allowList.tokens.forEach((token) => tokensAddresses.set(token.address?.toLowerCase() || NATIVE, true));

  const allowedBalances = tokenBalances.balances.filter((balance) => {
    // Balance is <= 0 and it is not allow to have zeros
    if (balance.balance.lte(0) && !allowZero) return false;

    return tokensAddresses.get(balance.token.address?.toLowerCase() || NATIVE);
  }) ?? [];

  return { allowList, allowedBalances };
};
