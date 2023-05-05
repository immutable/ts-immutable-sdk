import {
  GetTokenAllowListParams,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
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
