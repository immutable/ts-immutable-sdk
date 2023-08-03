import {
  ChainId, CheckoutConfiguration, GetBalanceResult, NetworkInfo,
} from '@imtbl/checkout-sdk';
import { getL1ChainId, getL2ChainId } from './networkUtils';
import {
  DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS,
  DEFAULT_TOKEN_FORMATTING_DECIMALS,
  IMX_ADDRESS_ZKEVM,
  NATIVE,
} from './constants';

export const sortTokensByAmount = (
  config: CheckoutConfiguration,
  tokens: GetBalanceResult[],
  chainId: ChainId,
) => tokens.sort((a, b) => {
  // make sure IMX is at the top of the list
  if (
    chainId === getL2ChainId(config)
      && a.token.symbol.toLowerCase() === 'imx'
      && b.token.symbol.toLowerCase() !== 'imx'
  ) {
    return -1;
  }

  if (
    chainId === getL2ChainId(config)
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
  config: CheckoutConfiguration,
) => {
  // make sure zkEVM at start of the list then L1
  if (a.chainId === getL2ChainId(config)) {
    return -1;
  }
  if (a.chainId === getL1ChainId(config)) {
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

export const formatZeroAmount = (
  amount: string,
  allowZeros: boolean = false,
) => {
  const fallback = '-.--';
  if (!amount) return fallback;
  if (amount === '0.00' && !allowZeros) return fallback;
  return amount;
};

export const tokenValueFormat = (s: Number | string): string => {
  const asString = s.toString();

  const pointIndex = asString.indexOf('.');
  if (pointIndex === -1) return asString;

  if (asString[0] !== '.' && parseInt(asString[0], 10) > 0) {
    let formatted = parseFloat(asString.substring(
      0,
      pointIndex + DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS + 1,
    )).toFixed(DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS);

    if (formatted.endsWith('.00')) {
      // eslint-disable-next-line prefer-destructuring
      formatted = formatted.substring(0, pointIndex);
    }
    return formatted;
  }

  return asString.substring(
    0,
    pointIndex + DEFAULT_TOKEN_FORMATTING_DECIMALS + 1,
  );
};

export const isZkEvmChainId = (chainId: ChainId) => chainId === ChainId.IMTBL_ZKEVM_DEVNET
  || chainId === ChainId.IMTBL_ZKEVM_TESTNET
  || chainId === ChainId.IMTBL_ZKEVM_MAINNET;

export const isNativeToken = (
  address?: string,
  chainId?: ChainId,
): boolean => {
  if (chainId && isZkEvmChainId(chainId)) {
    return address === IMX_ADDRESS_ZKEVM;
  }
  return !address || address.toLocaleUpperCase() === NATIVE;
};
