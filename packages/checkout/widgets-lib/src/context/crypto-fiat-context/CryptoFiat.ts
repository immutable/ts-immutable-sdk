import { CryptoFiat, CryptoFiatConvertReturn } from '@imtbl/cryptofiat';
import { FiatSymbols } from './CryptoFiatContext';

export const getCryptoToFiatConversion = async (
  cryptoFiat: CryptoFiat,
  fiatSymbol: FiatSymbols,
  tokenSymbols: string[]
): Promise<Map<string, number>> => {
  try {
    if (tokenSymbols.length === 0) return new Map<string, number>();

    const cryptoToFiatResult = await cryptoFiat.convert({
      tokenSymbols,
      fiatSymbol,
    });

    return updateConversions(cryptoToFiatResult, fiatSymbol);
  } catch (err: any) {
    return new Map<string, number>();
  }
};

export const updateConversions = (
  cryptoToFiatResult: CryptoFiatConvertReturn,
  fiatSymbol: FiatSymbols
): Map<string, number> => {
  const conversionMap = new Map<string, number>();

  for (const tokenSymbol in cryptoToFiatResult) {
    const conversion = cryptoToFiatResult[tokenSymbol];
    const usdAmount = conversion[fiatSymbol];

    if (usdAmount !== undefined) {
      conversionMap.set(tokenSymbol, usdAmount);
    }
  }
  return conversionMap;
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
