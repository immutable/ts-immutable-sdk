import {
  GetTokenAllowListParams,
  TokenInfo,
  ConvertTokensToFiatParams,
  SupportedFiatCurrencies,
  FetchQuotesResult,
  ConvertTokensToFiatResult,
} from '../types';
import { getTokenAllowList } from '../tokens';
import { utils } from 'ethers';
import axios from 'axios';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';

export const fetchTokenIds = async (tokens: TokenInfo[]) => {
  const coinListApi = 'https://api.coingecko.com/api/v3/coins/list';
  const tokenSymbols = tokens.map((token) => token.symbol.toLowerCase());
  let res;

  res = await withCheckoutError(
    async () => await (await fetch(coinListApi)).json(), {
    type: CheckoutErrorType.FIAT_CONVERSION_ERROR,
  });

  const tokenIds = res.reduce(
    (acc: object, token: { id: string; symbol: string }) => {
      if (!tokenSymbols.includes(token.symbol)) {
        return acc;
      }

      return {
        ...acc,
        [token.id]: token.symbol.toUpperCase(),
      };
    },
    {}
  );

  return tokenIds;
};

export const fetchQuotesFromCoinGecko = async (
  tokens: TokenInfo[],
  fiatSymbol: string
): Promise<FetchQuotesResult> => {
  const tokenIds: { [key: string]: string } = await fetchTokenIds(tokens);
  const idsString = Object.keys(tokenIds).join(',');
  const quoteApi = `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&precision=full&vs_currencies=${fiatSymbol}&include_last_updated_at=true`;
  const { data } = await withCheckoutError(
    async () => await (await fetch(quoteApi)).json(),
    {
      type: CheckoutErrorType.FIAT_CONVERSION_ERROR,
    }
  );

  const result: FetchQuotesResult = {};

  Object.values(data).forEach((quote: any, idx: number) => {
    result[Object.values(tokenIds)[idx]] = {
      quote: quote[fiatSymbol.toLowerCase()],
      quotedAt: quote.last_updated_at,
    };
  });

  return result;
};

export const fetchConversionRates = async (
  tokens: TokenInfo[],
  fiatSymbol: string
): Promise<FetchQuotesResult> => {
  return await fetchQuotesFromCoinGecko(tokens, fiatSymbol);
};

export const convertTokensToFiat = async ({
  amounts,
  fiatSymbol,
}: ConvertTokensToFiatParams) => {
  const allowedTokens = (
    await getTokenAllowList({} as GetTokenAllowListParams)
  ).tokens.map((tkn: TokenInfo) => tkn.address);
  const tokens = Object.values(amounts).map((amt) => amt.token);

  tokens.forEach((token: TokenInfo) => {
    if (!allowedTokens.includes(token.address)) {
      throw new CheckoutError(
        'Token is not supported',
        CheckoutErrorType.TOKEN_NOT_SUPPORTED_ERROR
      );
    }
  });

  if (!Object.values(SupportedFiatCurrencies).includes(fiatSymbol)) {
    throw new CheckoutError(
      'Fiat currency is not supported',
      CheckoutErrorType.FIAT_CURRENCY_NOT_SUPPORTED_ERROR
    );
  }
  const quotes: FetchQuotesResult = await fetchConversionRates(
    tokens,
    fiatSymbol
  );
  const conversions = tokens.reduce((acc: object, token: TokenInfo) => {
    const quote = quotes[token.symbol];
    if (!quote) {
      return acc;
    }

    const amount = amounts[token.symbol].amount;
    const decimalAmount = Number(utils.formatUnits(amount, token.decimals)); // maybe some protection against NaN
    const convertedAmount = decimalAmount * quote.quote;

    return {
      ...acc,
      [token.symbol]: {
        token,
        fiatSymbol,
        quotedAt: quote.quotedAt,
        quote: quote.quote,
        amount,
        convertedAmount,
      },
    };
  }, {});

  return conversions as ConvertTokensToFiatResult;
};
