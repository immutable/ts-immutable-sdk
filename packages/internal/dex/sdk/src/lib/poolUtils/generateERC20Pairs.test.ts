import { describe, it } from '@jest/globals';
import { Token } from '@uniswap/sdk-core';
import { generateERC20Pairs, ERC20Pair } from './generateERC20Pairs';
import {
  FUN_TEST_CHAIN,
  IMX_TEST_CHAIN,
  USDC_TEST_CHAIN,
  WETH_TEST_CHAIN,
} from '../../utils/testUtils';

// TI TO [] = [TI / TO]
// TI TO [TX] = [TI / TO, TI / TX, TO / TX]
// TI TO [TI] = [TI / TO]
// TI TO [TX, TZ] = [TI / TO, TI / TX, TI / TZ, TO / TX, TO / TZ, TX / TZ]
// TI TO [TX, TZ, TI] = [TI / TO, TI / TX, TI / TZ, TO / TZ, TO / TX, TX / TZ]
describe('generateERC20Pairs', () => {
  describe('when no CommonRoutingTokens exist', () => {
    it('should only return the TokenIn/TokenOut pair', async () => {
      const tokenPair: ERC20Pair = [IMX_TEST_CHAIN, USDC_TEST_CHAIN];
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
      const tokenPair: ERC20Pair = [IMX_TEST_CHAIN, USDC_TEST_CHAIN];
      const commonRoutingTokens: Token[] = [WETH_TEST_CHAIN];

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
      const tokenPair: ERC20Pair = [IMX_TEST_CHAIN, USDC_TEST_CHAIN];
      const commonRoutingTokens: Token[] = [USDC_TEST_CHAIN];

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

  describe('when given a TokenIn and TokenOut pair and there are two CommonRoutingTokens, and neither of the CommonRoutingTokens are the same as TokenIn or TokenOut', () => {
    it('should create six pairs', () => {
      // We expect...
      // TI TO [TX, TZ] = [TI / TO, TI / TX, TI / TZ, TO / TX, TO / TZ, TX / TZ]
      const tokenPair: ERC20Pair = [IMX_TEST_CHAIN, USDC_TEST_CHAIN];
      const commonRoutingTokens: Token[] = [WETH_TEST_CHAIN, FUN_TEST_CHAIN];

      const tokenPairs = generateERC20Pairs(tokenPair, commonRoutingTokens);
      expect(tokenPairs).toHaveLength(6);
    });
  });

  describe('when given a TokenIn and TokenOut pair and there are three CommonRoutingTokens, and one of the CommonRoutingTokens is the same as TokenIn', () => {
    it('should create six pairs', async () => {
      // We expect...
      // TI TO [TX, TZ] = [TI / TO, TI / TX, TI / TZ, TO / TX, TO / TZ, TX / TZ]
      const tokenPair: ERC20Pair = [IMX_TEST_CHAIN, USDC_TEST_CHAIN];
      const commonRoutingTokens: Token[] = [WETH_TEST_CHAIN, FUN_TEST_CHAIN];

      const tokenPairs = generateERC20Pairs(tokenPair, commonRoutingTokens);
      expect(tokenPairs).toHaveLength(6);
    });
  });
});
