/* eslint-disable @typescript-eslint/naming-convention */
import { SignableToken } from '@imtbl/generated-clients/src/imx';
import { TokenAmount } from '../types/tokens';

/**
 * Helper method to convert token type to a SignableToken type
 * @param token - the token type to convert to a SignableToken type
 * @returns the converted SignableToken
 */
export function convertToSignableToken(token: TokenAmount): SignableToken {
  switch (token.type) {
    case 'ERC721':
      return {
        type: 'ERC721',
        data: {
          token_id: token.tokenId,
          token_address: token.tokenAddress,
        },
      };
    case 'ERC20':
      return {
        type: 'ERC20',
        data: {
          token_address: token.tokenAddress,
        },
      };
    case 'ETH':
    default:
      return {
        type: 'ETH',
        data: {
          decimals: 18,
        },
      };
  }
}
