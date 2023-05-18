import { CryptoFiat, CryptoFiatConvertReturn } from '@imtbl/cryptofiat';
import { FiatSymbols } from './CryptoFiatContext';

export const updateConversions = (
  cryptoToFiatResult: CryptoFiatConvertReturn,
  fiatSymbol: FiatSymbols,
): Map<string, number> => {
  const conversionMap = new Map<string, number>();

  // TODO: Consider using Object.keys(cryptoToFiatResult) instead of for...in
  // for...in includes properties from the prototype chain
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const tokenSymbol in cryptoToFiatResult) {
    const conversion = cryptoToFiatResult[tokenSymbol];
    const usdAmount = conversion[fiatSymbol];

    if (usdAmount !== undefined) {
      conversionMap.set(tokenSymbol, usdAmount);
    }
  }
  return conversionMap;
};

export const getCryptoToFiatConversion = async (
  cryptoFiat: CryptoFiat,
  fiatSymbol: FiatSymbols,
  tokenSymbols: string[],
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
