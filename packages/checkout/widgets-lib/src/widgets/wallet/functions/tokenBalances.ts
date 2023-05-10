import { Web3Provider } from '@ethersproject/providers';
import { Checkout, ChainId, GetBalanceResult } from '@imtbl/checkout-sdk';
import { sortTokensByAmount } from '../../../lib/utils';
import { CryptoFiat, CryptoFiatConvertReturn } from '@imtbl/cryptofiat';

enum FiatSymbols {
  USD = 'usd'
}

export interface BalanceInfo {
  id: string;
  symbol: string;
  description?: string;
  balance: string;
  fiatAmount: string;
  iconLogo?: string;
}

export const getTokenBalances = async (
  checkout: Checkout,
  provider: Web3Provider,
  networkName: string,
  chainId: ChainId,
  cryptoFiat: CryptoFiat
): Promise<BalanceInfo[]> => {
  if (!checkout || !provider || !chainId) return [];

  try {
    const walletAddress = await provider.getSigner().getAddress();
    const getAllBalancesResult = await checkout.getAllBalances({
      provider,
      walletAddress,
      chainId,
    });

    const sortedTokens = sortTokensByAmount(
      checkout.config.environment,
      getAllBalancesResult.balances,
      chainId
    );

    const cryptoToFiatResult = await cryptoFiat.convert(
      buildCryptoToFiatRequest(getAllBalancesResult.balances)
    );

    const tokenBalances: BalanceInfo[] = [];
    sortedTokens.forEach((balance) => {
      tokenBalances.push({
        id: networkName + '-' + balance.token.symbol,
        balance: balance.formattedBalance,
        fiatAmount: calculateCryptoToFiatValue(
          balance.formattedBalance,
          balance.token.symbol,
          cryptoToFiatResult
        ),
        symbol: balance.token.symbol,
        description: balance.token.name,
      });
    });

    return tokenBalances;
  } catch (err: any) {
    return []; // todo: what are the error scenarios?
  }
};

export interface RequestStructure {
  tokenSymbols: string[];
  fiatSymbols: string[];
}

const buildCryptoToFiatRequest = (
  balances: GetBalanceResult[]
): RequestStructure => {
  const tokenSymbols = balances.map((balance) => balance.token.symbol);
  const fiatSymbols = [FiatSymbols.USD];

  const request: RequestStructure = {
    tokenSymbols,
    fiatSymbols,
  };
  return request;
};

export const calculateCryptoToFiatValue = (
  balance: string,
  symbol: string,
  conversions: CryptoFiatConvertReturn
): string => {
  const zeroBalanceString = '-.--';
  if (!balance) return zeroBalanceString;

  const conversion = conversions[symbol.toLowerCase()];
  if (!conversion) return zeroBalanceString;

  const parsedBalance = parseFloat(balance);
  if (parseFloat(balance) === 0 || isNaN(parsedBalance))
    return zeroBalanceString;

  if (!conversion[FiatSymbols.USD]) return zeroBalanceString;

  return formatFiatString(parsedBalance * conversion[FiatSymbols.USD]);
};

export const formatFiatString = (amount: number): string => {
  const factor = Math.pow(10, 2);
  return (Math.round(amount * factor) / factor).toFixed(2).toString();
};
