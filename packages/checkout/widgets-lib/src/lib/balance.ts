import { BrowserProvider } from 'ethers';
import {
  ChainId,
  Checkout,
  GetBalanceResult,
  GetTokenAllowListResult,
  TokenFilterTypes,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { RetryType, retry } from './retry';
import { DEFAULT_BALANCE_RETRY_POLICY, NATIVE } from './constants';
import { getTokenImageByAddress, isNativeToken } from './utils';

export type GetAllowedBalancesParamsType = {
  checkout: Checkout,
  provider: BrowserProvider,
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

  const walletAddress = await (await provider.getSigner()).getAddress();
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

  const tokensAddresses = new Map();
  allowList.tokens.forEach((token) => tokensAddresses.set(token.address?.toLowerCase() || NATIVE, true));

  const allowedBalances = tokenBalances.balances
    .filter((balance) => {
      // Balance is <= 0 and it is not allow to have zeros
      if (balance.balance <= 0 && !allowZero) return false;
      return tokensAddresses.get(balance.token.address?.toLowerCase() || NATIVE);
    })
    .map((balanceResult) => ({
      ...balanceResult,
      token: {
        ...balanceResult.token,
        icon: balanceResult.token.icon ?? getTokenImageByAddress(
          checkout.config.environment as Environment,
          isNativeToken(balanceResult.token.address)
            ? balanceResult.token.symbol
            : balanceResult.token.address ?? '',
        ),
      },
    })) ?? [];

  // Map token icon assets to allowlist
  allowList.tokens = allowList.tokens.map((token) => ({
    ...token,
    icon: token.icon ?? getTokenImageByAddress(
      checkout.config.environment as Environment,
      isNativeToken(token.address) ? token.symbol : token.address ?? '',
    ),
  }));

  return { allowList, allowedBalances };
};
