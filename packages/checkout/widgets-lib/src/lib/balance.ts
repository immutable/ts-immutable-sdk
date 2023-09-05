import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  Checkout,
  GetBalanceResult,
  GetTokenAllowListResult,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import { RetryType, retry } from './retry';
import { DEFAULT_BALANCE_RETRY_POLICY, IMX_ADDRESS_ZKEVM } from './constants';

export type GetAllowedBalancesParamsType = {
  checkout: Checkout,
  provider: Web3Provider,
  allowTokenListType: TokenFilterTypes,
  allowNative?: boolean,
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
  allowNative = false,
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
  allowList.tokens.forEach((token) => tokensAddresses.set(token.address || '', true));

  const allowedBalances = tokenBalances.balances.filter((balance) => {
    // Token is native (no address or address is IMX_ADDRESS_ZKEVM) and it is not allow to have native tokens
    if ((!balance.token.address || balance.token.address === IMX_ADDRESS_ZKEVM) && !allowNative) return false;

    // Balance is <= 0 and it is not allow to have zeros
    if (balance.balance.lte(0) && !allowZero) return false;

    return tokensAddresses.get(balance.token.address);
  });

  return { allowList, allowedBalances };
};
