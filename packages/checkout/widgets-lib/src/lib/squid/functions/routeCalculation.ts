import { formatUnits, parseUnits } from 'ethers';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { calculateAdjustedAmount } from './slippage';
import { FromAmountData, Token } from '../types';
import { findToken } from './findToken';
import { isPassportProvider } from '../../provider/utils';
import { SQUID_NATIVE_TOKEN } from '../config';

const INSUFFICIENT_GAS_THRESHOLD = 0.1;

/**
 * Functions to handle route amount calculations.
 */

/**
 * Calculate the fromAmount based on USD prices and slippage.
 */
export const calculateFromAmount = (
  fromToken: Token,
  toToken: Token,
  toAmount: string,
  additionalBuffer: number = 0,
) => {
  const toAmountNumber = parseFloat(toAmount);
  // Calculate the USD value of the toAmount
  const toAmountInUsd = toAmountNumber * toToken.usdPrice;
  // Calculate the amount of fromToken needed to match this USD value
  const baseFromAmount = toAmountInUsd / fromToken.usdPrice;
  // Add a buffer for price fluctuations and fees
  const fromAmountWithBuffer = calculateAdjustedAmount(baseFromAmount, toAmountInUsd, additionalBuffer);

  return fromAmountWithBuffer.toString();
};

/**
 * Calculate the fromAmount using exchange rate returned from the route.
 */
export const calculateFromAmountFromRoute = (
  exchangeRate: string,
  toAmount: string,
  toAmountUSD?: string,
) => {
  const toAmountUSDNumber = toAmountUSD ? parseFloat(toAmountUSD) : 0;
  const fromAmount = parseFloat(toAmount) / parseFloat(exchangeRate);
  const fromAmountWithBuffer = calculateAdjustedAmount(fromAmount, toAmountUSDNumber);
  return fromAmountWithBuffer.toString();
};

/**
 * Convert a string amount to a formatted amount with the specified number of decimals.
 */
export const convertToFormattedFromAmount = (amount: string, decimals: number) => {
  const parsedFromAmount = parseFloat(amount).toFixed(decimals);
  const formattedFromAmount = parseUnits(parsedFromAmount, decimals);
  return formattedFromAmount.toString();
};

export const getFromAmountData = (
  tokens: Token[],
  balance: TokenBalance,
  toAmount: string,
  toChainId: string,
  toTokenAddress: string,
  additionalBuffer: number = 0,
): FromAmountData | undefined => {
  const fromToken = findToken(
    tokens,
    balance.address,
    balance.chainId.toString(),
  );
  const toToken = findToken(tokens, toTokenAddress, toChainId);

  if (!fromToken || !toToken) {
    return undefined;
  }

  return {
    fromToken,
    fromAmount: calculateFromAmount(
      fromToken,
      toToken,
      toAmount,
      additionalBuffer,
    ),
    toToken,
    toAmount,
    balance,
    additionalBuffer,
  };
};

export const getSufficientFromAmounts = (
  tokens: Token[],
  balances: TokenBalance[],
  toChainId: string,
  toTokenAddress: string,
  toAmount: string,
): FromAmountData[] => {
  const filteredBalances = balances.filter(
    (balance) => !(
      balance.address.toLowerCase() === toTokenAddress.toLowerCase()
        && balance.chainId === toChainId
    ),
  );

  const fromAmountDataArray: FromAmountData[] = filteredBalances
    .map((balance) => getFromAmountData(tokens, balance, toAmount, toChainId, toTokenAddress))
    .filter((value) => value !== undefined);

  return fromAmountDataArray.filter((data: FromAmountData) => {
    const formattedBalance = formatUnits(
      data.balance.balance,
      data.balance.decimals,
    );
    return (
      parseFloat(formattedBalance.toString()) > parseFloat(data.fromAmount)
    );
  });
};

export const hasSufficientBalance = (
  balances: TokenBalance[],
  toTokenAddress: string,
  toChainId: string,
  toAmount: string,
): boolean => {
  const matchingTokens = balances.filter(
    (balance) => balance.address.toLowerCase() === toTokenAddress.toLowerCase()
      && balance.chainId.toString() === toChainId.toString(),
  );

  if (matchingTokens.length > 0) {
    return matchingTokens.some((balance) => {
      const tokenAmount = parseFloat(formatUnits(balance.balance, balance.decimals));
      return tokenAmount >= parseFloat(toAmount);
    });
  }

  return false;
};

export const hasSufficientGas = (
  balances: TokenBalance[],
  selectedChainId: string | number,
  provider: WrappedBrowserProvider | undefined,
): boolean => {
  if (!provider) return false;
  if (isPassportProvider(provider)) return true;

  const nativeCurrencyBalance = balances.find(
    (balance) => balance.address.toLowerCase() === SQUID_NATIVE_TOKEN.toLowerCase()
      && balance.chainId.toString() === selectedChainId.toString(),
  );
  if (!nativeCurrencyBalance) return false;

  const nativeCurrencyBalanceAmount = parseFloat(
    formatUnits(nativeCurrencyBalance.balance, nativeCurrencyBalance.decimals),
  );
  if (nativeCurrencyBalanceAmount < INSUFFICIENT_GAS_THRESHOLD) return false;
  return true;
};
