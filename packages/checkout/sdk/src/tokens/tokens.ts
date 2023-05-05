import {
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
  ConvertTokensToFiatParams,
  SupportedFiatCurrencies,
  FetchQuotesResult,
  ConvertTokensToFiatResult,
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

const fetchTokenIdsFor = async (tokens: TokenInfo[]) => {
  const coinListApi = 'https://api.coingecko.com/api/v3/coins/list';
  const tokenSymbols = tokens.map((token) => token.symbol.toLowerCase());
  let res;

  res = await withCheckoutError(async () => await axios.get(coinListApi), {
    type: CheckoutErrorType.FIAT_CONVERSION_ERROR,
  });

  const tokenIds = res.data.reduce(
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

const fetchQuotesFromCoinGecko = async (
  tokens: TokenInfo[],
  fiatSymbol: string
): Promise<FetchQuotesResult> => {
  const tokenIds: { [key: string]: string } = await fetchTokenIdsFor(tokens);
  const idsString = Object.keys(tokenIds).join(',');
  const quoteApi = `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&precision=full&vs_currencies=${fiatSymbol}&include_last_updated_at=true`;
  const { data } = await withCheckoutError(
    async () => await axios.get(quoteApi),
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

const fetchConversionRatesFor = async (
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
  const quotes: any = await fetchConversionRatesFor(tokens, fiatSymbol);
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
