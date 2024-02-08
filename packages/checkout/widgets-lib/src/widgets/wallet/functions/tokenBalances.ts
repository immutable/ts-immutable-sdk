import { Web3Provider } from '@ethersproject/providers';
import { Checkout, ChainId, GetBalanceResult } from '@imtbl/checkout-sdk';
import { calculateCryptoToFiat, sortTokensByAmount } from '../../../lib/utils';
import { DEFAULT_BALANCE_RETRY_POLICY } from '../../../lib';
import { retry } from '../../../lib/retry';

export type BalanceInfo = {
  id: string;
  symbol: string;
  address?: string;
  description?: string;
  balance: string;
  fiatAmount: string;
  iconLogo?: string;
};

export const getTokenBalances = async (
  checkout: Checkout,
  provider: Web3Provider,
  chainId: ChainId,
): Promise<GetBalanceResult[]> => {
  if (!checkout || !provider || !chainId) return [];

  const walletAddress = await provider.getSigner().getAddress();
  // Do not catch the error so that the caller can decide
  // how to handle the experience.
  const getAllBalancesResult = await retry(
    () => checkout.getAllBalances({
      provider,
      walletAddress,
      chainId,
    }),
    DEFAULT_BALANCE_RETRY_POLICY,
  );
  if (!getAllBalancesResult) return [];

  const sortedTokens = sortTokensByAmount(
    checkout.config,
    getAllBalancesResult.balances,
    chainId,
  );

  return sortedTokens;
};

const formatTokenId = (chainId: ChainId, symbol: string, address?: string) => {
  if (!address) return `${chainId.toString()}-${symbol.toLowerCase()}`;
  return `${chainId.toString()}-${symbol.toLowerCase()}-${address.toLowerCase()}`;
};

export const mapTokenBalancesWithConversions = (
  chainId: ChainId,
  balances: GetBalanceResult[],
  conversions: Map<string, number>,
): BalanceInfo[] => balances.map((balance) => ({
  id: formatTokenId(chainId, balance.token.symbol, balance.token.address),
  balance: balance.formattedBalance,
  fiatAmount: calculateCryptoToFiat(
    balance.formattedBalance,
    balance.token.symbol,
    conversions,
  ),
  symbol: balance.token.symbol,
  address: balance.token.address,
  description: balance.token.name,
  iconLogo: balance.token.icon,
}));
