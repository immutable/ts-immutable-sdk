import { Web3Provider } from '@ethersproject/providers';
import { Checkout, ChainId, GetBalanceResult } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { CryptoFiat } from '@imtbl/cryptofiat';
import {
  getTokenImageByAddress,
  isNativeToken,
  sortTokensByAmount,
} from '../../../lib/utils';
import { DEFAULT_BALANCE_RETRY_POLICY } from '../../../lib';
import { retry } from '../../../lib/retry';

export type BalanceInfo = {
  id: string;
  symbol: string;
  address?: string;
  description?: string;
  balance: string;
  fiatAmount: string;
  icon?: string;
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
  ).map((balanceResult) => ({
    ...balanceResult,
    token: {
      ...balanceResult.token,
      icon:
        balanceResult.token.icon
        ?? getTokenImageByAddress(
          checkout.config.environment as Environment,
          isNativeToken(balanceResult.token.address)
            ? balanceResult.token.symbol
            : balanceResult.token.address ?? '',
        ),
    },
  }));

  return sortedTokens;
};

const formatTokenId = (chainId: ChainId, symbol: string, address?: string) => {
  if (!address) return `${chainId.toString()}-${symbol.toLowerCase()}`;
  return `${chainId.toString()}-${symbol.toLowerCase()}-${address.toLowerCase()}`;
};

export const mapTokenBalancesWithConversions = async (
  chainId: ChainId,
  balances: GetBalanceResult[],
  cryptoFiat: CryptoFiat,
): Promise<BalanceInfo[]> => {
  if (!balances.length) return [];

  // Get all unique token symbols
  const tokenSymbols = balances.map((balance) => balance.token.symbol.toLowerCase());

  console.log('token symbols', tokenSymbols);
  // Get conversion rates for all tokens at once
  const conversionResults = await cryptoFiat.convert({
    tokenSymbols,
    fiatSymbols: ['usd'], // Using USD as the default fiat currency
  });

  console.log('convert', conversionResults);

  return balances.map((balance) => ({
    id: formatTokenId(chainId, balance.token.symbol, balance.token.address),
    balance: balance.formattedBalance,
    fiatAmount: (() => {
      const symbol = balance.token.symbol.toLowerCase();
      const conversion = conversionResults[symbol]?.usd;
      if (!conversion || !balance.formattedBalance) return '0.00';
      const numericBalance = parseFloat(balance.formattedBalance);
      if (Number.isNaN(numericBalance)) return '0.00';

      return (numericBalance * conversion).toFixed(2);
    })(),
    symbol: balance.token.symbol,
    address: balance.token.address,
    description: balance.token.name,
    icon: balance.token.icon ?? getTokenImageByAddress(
      cryptoFiat.config.environment as Environment,
      isNativeToken(balance.token.address)
        ? balance.token.symbol
        : balance.token.address ?? '',
    ),
  }));
};
