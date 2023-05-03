import {
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
  ConvertTokenToFiatParams,
  SupportedFiatCurrencies,
} from '../types';
import masterTokenList from './token_master_list.json';
import { utils } from 'ethers';
import axios from 'axios';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';

export const getTokenAllowList = async function ({
  type = TokenFilterTypes.ALL,
  chainId,
  exclude,
}: GetTokenAllowListParams): Promise<GetTokenAllowListResult> {
  // todo:For API call, use the CheckoutError with errorType:API_CALL_ERROR?? or any other

  const filteredTokenList = masterTokenList
    .filter((token) => {
      const chainIdMatches = !chainId || token.chainId == chainId;
      const tokenNotExcluded = !exclude
        ?.map((excludeToken) => excludeToken.address)
        .includes(token.address || '');
      const allowAllTokens = type === TokenFilterTypes.ALL;
      const tokenAllowedForType = token.tokenFeatures.includes(type);

      return (
        chainIdMatches &&
        tokenNotExcluded &&
        (allowAllTokens || tokenAllowedForType)
      );
    })
    .map((token) => {
      const { chainId, tokenFeatures, ...tokenInfo } = token;
      return tokenInfo as TokenInfo;
    });

  return {
    tokens: filteredTokenList,
  };
};

const fetchTokenIdFor = async (symbol: string) => {
  const coinListApi = 'https://api.coingecko.com/api/v3/coins/list';
  let res;

  res = await withCheckoutError(async () => await axios.get(coinListApi), {
    type: CheckoutErrorType.FIAT_CONVERSION_ERROR,
  });

  const token = res.data.find(
    (tkn: { symbol: string }) => tkn.symbol == symbol.toLowerCase()
  );

  if (!token) {
    throw 'no token lmao';
  }

  return token.id;
};

const fetchQuoteFromCoinGecko = async (
  token: TokenInfo,
  fiatSymbol: string
): Promise<{ quote: number; quotedAt: number }> => {
  const tokenId = await fetchTokenIdFor(token.symbol);
  const timeNow = Math.floor(Date.now() / 1000);
  const fromTime = timeNow - 3600 * 1000;
  const quoteApi = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range?vs_currency=${fiatSymbol}&from=${fromTime}&to=${timeNow}`;
  const {
    data: { prices },
  } = await withCheckoutError(async () => await axios.get(quoteApi), {
    type: CheckoutErrorType.FIAT_CONVERSION_ERROR,
  });

  const sortedPrices = prices.sort((a: number[], b: number[]) => {
    if (a[0] < b[0]) {
      return -1;
    }
    if (a[0] > b[0]) {
      return 1;
    }

    return 0;
  });

  const quote = sortedPrices.pop();

  return {
    quote: quote[1],
    quotedAt: quote[0],
  };
};

const fetchConversionRateFor = async (
  token: TokenInfo,
  fiatSymbol: string
): Promise<{ quote: number; quotedAt: number }> => {
  return await fetchQuoteFromCoinGecko(token, fiatSymbol);
};

export const convertTokenToFiat = async ({
  amount,
  token,
  fiatSymbol,
}: ConvertTokenToFiatParams) => {
  const allowedTokens = (
    await getTokenAllowList({} as GetTokenAllowListParams)
  ).tokens.map((tkn: TokenInfo) => tkn.address);

  if (!allowedTokens.includes(token.address)) {
    throw new CheckoutError(
      'Token is not supported',
      CheckoutErrorType.FIAT_CONVERSION_ERROR
    );
  }

  if (!Object.values(SupportedFiatCurrencies).includes(fiatSymbol)) {
    throw new CheckoutError(
      'Fiat currency is not supported',
      CheckoutErrorType.FIAT_CONVERSION_ERROR
    );
  }
  const { quote, quotedAt } = await fetchConversionRateFor(token, fiatSymbol);
  const decimalAmount = Number(utils.formatUnits(amount, token.decimals)); // maybe some protection against NaN
  const convertedAmount = decimalAmount * quote;

  return {
    token,
    fiatSymbol,
    quotedAt,
    quote,
    amount,
    convertedAmount,
  };
};
