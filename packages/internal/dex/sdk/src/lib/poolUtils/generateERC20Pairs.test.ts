import { Token } from '@uniswap/sdk-core';
import { generateERC20Pairs, ERC20Pair } from './generateERC20Pairs';
import {
  FUN_TEST_TOKEN,
  IMX_TEST_TOKEN,
  USDC_TEST_TOKEN,
  WETH_TEST_TOKEN,
  uniqBy,
} from '../../test/utils';
import { ensureCorrectERC20AddressOrder } from './computePoolAddress';

// TI TO [] = [TI / TO]
// TI TO [TX] = [TI / TO, TI / TX, TO / TX]
// TI TO [TI] = [TI / TO]
// TI TO [TX, TZ] = [TI / TO, TI / TX, TI / TZ, TO / TX, TO / TZ, TX / TZ]
// TI TO [TX, TZ, TI] = [TI / TO, TI / TX, TI / TZ, TO / TZ, TO / TX, TX / TZ]
describe('generateERC20Pairs', () => {
  describe('when no CommonRoutingTokens exist', () => {
    it('should only return the TokenIn/TokenOut pair', async () => {
      const tokenPair: ERC20Pair = [IMX_TEST_TOKEN, USDC_TEST_TOKEN];
      const commonRoutingTokens: Token[] = [];

      const tokenPairs = generateERC20Pairs(tokenPair, commonRoutingTokens);
      expect(tokenPairs.length).toEqual(1);
      expect(tokenPairs).toMatchInlineSnapshot(`
        [
          [
            Token {
              "address": "0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851",
              "chainId": 999,
              "decimals": 18,
              "isNative": false,
              "isToken": true,
              "name": "Immutable X",
              "symbol": "IMX",
            },
            Token {
              "address": "0x93733225CCc07Ba02b1449aA3379418Ddc37F6EC",
              "chainId": 999,
              "decimals": 6,
              "isNative": false,
              "isToken": true,
              "name": "USD Coin",
              "symbol": "USDC",
            },
          ],
        ]
      `);
    });
  });

  describe('when given a TokenIn and TokenOut pair and there is a single CommonRoutingToken', () => {
    it('should create three pairs', async () => {
      // We expect...
      // TI TO [TX] = [TI / TO, TI / TX, TO / TX]
      const tokenPair: ERC20Pair = [IMX_TEST_TOKEN, USDC_TEST_TOKEN];
      const commonRoutingTokens: Token[] = [WETH_TEST_TOKEN];

      const tokenPairs = generateERC20Pairs(tokenPair, commonRoutingTokens);
      expect(tokenPairs.length).toEqual(3);
      expect(tokenPairs).toMatchInlineSnapshot(`
        [
          [
            Token {
              "address": "0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851",
              "chainId": 999,
              "decimals": 18,
              "isNative": false,
              "isToken": true,
              "name": "Immutable X",
              "symbol": "IMX",
            },
            Token {
              "address": "0x93733225CCc07Ba02b1449aA3379418Ddc37F6EC",
              "chainId": 999,
              "decimals": 6,
              "isNative": false,
              "isToken": true,
              "name": "USD Coin",
              "symbol": "USDC",
            },
          ],
          [
            Token {
              "address": "0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851",
              "chainId": 999,
              "decimals": 18,
              "isNative": false,
              "isToken": true,
              "name": "Immutable X",
              "symbol": "IMX",
            },
            Token {
              "address": "0x4F062A3EAeC3730560aB89b5CE5aC0ab2C5517aE",
              "chainId": 999,
              "decimals": 18,
              "isNative": false,
              "isToken": true,
              "name": "Wrapped Ether",
              "symbol": "WETH",
            },
          ],
          [
            Token {
              "address": "0x93733225CCc07Ba02b1449aA3379418Ddc37F6EC",
              "chainId": 999,
              "decimals": 6,
              "isNative": false,
              "isToken": true,
              "name": "USD Coin",
              "symbol": "USDC",
            },
            Token {
              "address": "0x4F062A3EAeC3730560aB89b5CE5aC0ab2C5517aE",
              "chainId": 999,
              "decimals": 18,
              "isNative": false,
              "isToken": true,
              "name": "Wrapped Ether",
              "symbol": "WETH",
            },
          ],
        ]
      `);
    });
  });

  describe('when given a TokenIn and TokenOut pair and the CommonRoutingToken is the same as TokenIn', () => {
    it('should create one pair', () => {
      // We expect...
      // TI TO [TI] = [TI / TO]
      const tokenPair: ERC20Pair = [IMX_TEST_TOKEN, USDC_TEST_TOKEN];

      // Create a copy of the Token object so that we do not have the same
      // instance of the object in the tokenPair and commonRoutingTokens
      const usdc = Object.assign(USDC_TEST_TOKEN);
      const commonRoutingTokens: Token[] = [usdc];

      const tokenPairs = generateERC20Pairs(tokenPair, commonRoutingTokens);
      expect(tokenPairs.length).toEqual(1);
      expect(tokenPairs).toMatchInlineSnapshot(`
        [
          [
            Token {
              "address": "0x72958b06abdF2701AcE6ceb3cE0B8B1CE11E0851",
              "chainId": 999,
              "decimals": 18,
              "isNative": false,
              "isToken": true,
              "name": "Immutable X",
              "symbol": "IMX",
            },
            Token {
              "address": "0x93733225CCc07Ba02b1449aA3379418Ddc37F6EC",
              "chainId": 999,
              "decimals": 6,
              "isNative": false,
              "isToken": true,
              "name": "USD Coin",
              "symbol": "USDC",
            },
          ],
        ]
      `);
    });
  });

  // eslint-disable-next-line max-len
  describe('when given a TokenIn and TokenOut pair and there are two CommonRoutingTokens, and neither of the CommonRoutingTokens are the same as TokenIn or TokenOut', () => {
    it('should create six pairs', () => {
      // We expect...
      // TI TO [TX, TZ] = [TI / TO, TI / TX, TI / TZ, TO / TX, TO / TZ, TX / TZ]
      const tokenPair: ERC20Pair = [IMX_TEST_TOKEN, USDC_TEST_TOKEN];
      const commonRoutingTokens: Token[] = [WETH_TEST_TOKEN, FUN_TEST_TOKEN];

      const tokenPairs = generateERC20Pairs(tokenPair, commonRoutingTokens);
      expect(tokenPairs).toHaveLength(6);
    });

    it('should not repeat pairs', async () => {
      // We expect...
      // TI TO [TX, TZ] = [TI / TO, TI / TX, TI / TZ, TO / TX, TO / TZ, TX / TZ]
      const tokenPair: ERC20Pair = [IMX_TEST_TOKEN, USDC_TEST_TOKEN];
      const commonRoutingTokens: Token[] = [WETH_TEST_TOKEN, FUN_TEST_TOKEN];

      const tokenPairs = generateERC20Pairs(tokenPair, commonRoutingTokens);

      const uniquePairs = uniqBy(tokenPairs, (tp) => {
        const orderedPair = ensureCorrectERC20AddressOrder(tp);

        return JSON.stringify([orderedPair[0].address, orderedPair[1].address]);
      });
      expect(uniquePairs.length).toEqual(6);
    });
  });
});
