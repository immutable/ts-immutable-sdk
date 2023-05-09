// TODO: Fix missing dependency for jest globals
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, it } from '@jest/globals';
import {
  FeeAmount, Pool, Route, TickMath,
} from '@uniswap/v3-sdk';
import { Token, Currency } from '@uniswap/sdk-core';
import { generateAllAcyclicPaths } from '../router';

const token0 = new Token(
  123,
  '0x4A062A3EAeC3730560aB89b5CE5aC0ab2C5517aE'.toLowerCase(),
  18,
);
const token1 = new Token(
  123,
  '0x4B062a3EAeC3730560aB89b5CE5aC0ab2C5517aE'.toLowerCase(),
  18,
);
const token2 = new Token(
  123,
  '0x4C062a3EAeC3730560aB89b5CE5aC0ab2C5517aE'.toLowerCase(),
  18,
);
const token3 = new Token(
  123,
  '0x4D062a3EAeC3730560aB89b5CE5aC0ab2C5517aE'.toLowerCase(),
  18,
);

describe('generateAllAcyclicPaths', () => {
  describe('when all pools are valid and maxHops includes all pools', () => {
    it('should return all valid pools', async () => {
      const maxHops = 3;
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      const pools: Pool[] = [];
      pools.push(
        new Pool(
          token0,
          token1,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token1,
          token2,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token1,
          token3,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token2,
          token3,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );

      const routes: Route<Currency, Currency>[] = generateAllAcyclicPaths(
        token0,
        token3,
        pools,
        [],
        [],
        token0,
        maxHops,
      );

      // There are two routes of maxHops = 3 that go from token0 to token3.
      expect(routes.length).toBe(2);
      // eslint-disable-next-line no-restricted-syntax
      for (const route of routes) {
        // The only two paths available are:
        //    token0 -> token1 -> token2 -> token3 (3 pools)
        //    token0 -> token1 -> token3 (2 pools)
        expect(route.pools.length === 3 || route.pools.length === 2);
        if (route.pools.length === 3) {
          expect(route.pools[0].token0).toBe(token0);
          expect(route.pools[0].token1).toBe(token1);
          expect(route.pools[1].token0).toBe(token1);
          expect(route.pools[1].token1).toBe(token2);
          expect(route.pools[2].token0).toBe(token2);
          expect(route.pools[2].token1).toBe(token3);
        } else {
          // (route.pools.length == 2)
          expect(route.pools[0].token0).toBe(token0);
          expect(route.pools[0].token1).toBe(token1);
          expect(route.pools[1].token0).toBe(token1);
          expect(route.pools[1].token1).toBe(token3);
        }
      }
    });
  });

  // Test maxHops appropriately restricts.
  describe('when all pools are valid but maxHops is restrictive', () => {
    it('should return all valid pools', async () => {
      const maxHops = 2;
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      const pools: Pool[] = [];
      pools.push(
        new Pool(
          token0,
          token1,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token1,
          token2,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token1,
          token3,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token2,
          token3,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );

      const routes: Route<Currency, Currency>[] = generateAllAcyclicPaths(
        token0,
        token3,
        pools,
        [],
        [],
        token0,
        maxHops,
      );

      // There is one route of maxHops = 2 that goes from token0 to token3.
      expect(routes.length).toBe(1);
      // The only path available is:
      //    token0 -> token1 -> token3 (2 pools)
      expect(routes[0].pools.length === 2);
      expect(routes[0].pools[0].token0).toBe(token0);
      expect(routes[0].pools[0].token1).toBe(token1);
      expect(routes[0].pools[1].token0).toBe(token1);
      expect(routes[0].pools[1].token1).toBe(token3);
    });
  });

  describe('when all pools are valid and maxHops allows for an extra route', () => {
    it('should return all valid pools', async () => {
      const maxHops = 4;
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      const pools: Pool[] = [];
      pools.push(
        new Pool(
          token0,
          token1,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token1,
          token2,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token1,
          token2,
          FeeAmount.LOW,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token1,
          token3,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );
      pools.push(
        new Pool(
          token2,
          token3,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          1000,
          arbitraryTick,
        ),
      );

      const routes: Route<Currency, Currency>[] = generateAllAcyclicPaths(
        token0,
        token3,
        pools,
        [],
        [],
        token0,
        maxHops,
      );

      // There are five route of maxHops = 4 that goes from token0 to token3.
      expect(routes.length).toBe(5);
      // eslint-disable-next-line no-restricted-syntax
      for (const route of routes) {
        // The five paths available are:
        //    token0 -> token1 -> token2 -> token1 -> token3 (4 pools)
        //    token0 -> token1 -> token2 -> token1 -> token3 (4 pools)
        //        (Switching the token1/token2 fees around)
        //    token0 -> token1 -> token2 -> token3 (3 pools)
        //    token0 -> token1 -> token2 -> token3 (3 pools)
        //       (Switching the token1/token2 fees around)
        //    token0 -> token1 -> token3 (2 pools)
        expect(
          route.pools.length === 4
            || route.pools.length === 3
            || route.pools.length === 2,
        );
        if (route.pools.length === 4) {
          expect(route.pools[0].token0).toBe(token0);
          expect(route.pools[0].token1).toBe(token1);
          expect(route.pools[1].token0).toBe(token1);
          expect(route.pools[1].token1).toBe(token2);
          expect(route.pools[2].token0).toBe(token1);
          expect(route.pools[2].token1).toBe(token2);
          expect(route.pools[3].token0).toBe(token1);
          expect(route.pools[3].token1).toBe(token3);
        }
      }
    });
  });
});
