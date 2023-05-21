import { ChainId, GetBalanceResult, NetworkInfo } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { L1Network, zkEVMNetwork } from './networkUtils';
import { DEFAULT_TOKEN_DECIMALS } from './constant';

export const sortTokensByAmount = (
  environment: Environment,
  tokens: GetBalanceResult[],
  chainId: ChainId,
) => tokens.sort((a, b) => {
  // make sure IMX is at the top of the list
  if (
    chainId === zkEVMNetwork(environment)
      && a.token.symbol.toLowerCase() === 'imx'
      && b.token.symbol.toLowerCase() !== 'imx'
  ) {
    return -1;
  }
  if (
    chainId === zkEVMNetwork(environment)
      && b.token.symbol.toLowerCase() === 'imx'
      && a.token.symbol.toLowerCase() !== 'imx'
  ) {
    return 1;
  }

  if (a.balance.lt(b.balance)) {
    return 1;
  }
  if (a.balance.gt(b.balance)) {
    return -1;
  }
  return 0;
});

export const sortNetworksCompareFn = (
  a: NetworkInfo,
  b: NetworkInfo,
  environment: Environment,
) => {
  // make sure zkEVM at start of the list then L1
  if (a.chainId === zkEVMNetwork(environment)) {
    return -1;
  }
  if (a.chainId === L1Network(environment)) {
    return 0;
  }
  return 1;
};

export const formatFiatString = (amount: number) => {
  const factor = 10 ** 2;
  return (Math.round(amount * factor) / factor).toFixed(2);
};

export const calculateCryptoToFiat = (
  amount: string,
  symbol: string,
  conversions: Map<string, number>,
): string => {
  const zeroString = '0.00';

  if (!amount) return zeroString;

  const conversion = conversions.get(symbol.toLowerCase());
  if (!conversion) return zeroString;

  const parsedAmount = parseFloat(amount);
  if (parseFloat(amount) === 0 || Number.isNaN(parsedAmount)) return zeroString;
  return formatFiatString(parsedAmount * conversion);
};

export const formatZeroAmount = (amount: string) => {
  if (!amount || amount === '0.00') return '-.--';
  return amount;
};

export const tokenValueFormat = (s: Number | string): string => {
  const asString = s.toString();

  const pointIndex = asString.indexOf('.');
  if (pointIndex === -1) return asString;

  return asString.substring(0, pointIndex + DEFAULT_TOKEN_DECIMALS + 1);
};
