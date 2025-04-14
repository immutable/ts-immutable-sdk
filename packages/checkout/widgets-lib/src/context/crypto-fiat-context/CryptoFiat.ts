import axios from 'axios';
import { CryptoFiat, CryptoFiatConvertReturn } from '@imtbl/cryptofiat';
import { IMMUTABLE_API_BASE_URL } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
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
      fiatSymbols: [fiatSymbol],
    });

    return updateConversions(cryptoToFiatResult, fiatSymbol);
  } catch (err: any) {
    return new Map<string, number>();
  }
};

async function getUSDConversionsForAll(environment: Environment) {
  const apiUrl = `${IMMUTABLE_API_BASE_URL[environment]}/checkout/v1/token-prices`;
  const response = await axios.get(apiUrl);

  const { data } = response;

  const result: CryptoFiatConvertReturn = {};
  for (const token of data) {
    result[token.symbol] = { usd: token.usd_price };
  }
  return result;
}

// returns the conversion for all tokens in
export const getCryptoToUSDConversion = async (
  environment: Environment,
): Promise<Map<string, number>> => {
  try {
    const cryptoToFiatResult = await getUSDConversionsForAll(environment);

    return updateConversions(cryptoToFiatResult, FiatSymbols.USD);
  } catch (err: any) {
    return new Map<string, number>();
  }
};
