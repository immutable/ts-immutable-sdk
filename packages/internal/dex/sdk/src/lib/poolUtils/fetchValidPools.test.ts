import { describe, it } from '@jest/globals';
import {
  BigNumber, Contract, providers, utils,
} from 'ethers';
import { TickMath } from '@uniswap/v3-sdk';
import { ProviderCallError } from 'errors';
import { fetchValidPools } from './fetchValidPools';
import { Multicall__factory } from '../../contracts/types';
import {
  IMX_TEST_CHAIN,
  TEST_CHAIN_ID,
  TEST_MULTICALL_ADDRESS,
  TEST_RPC_URL,
  TEST_V3_CORE_FACTORY_ADDRESS,
  WETH_TEST_CHAIN,
} from '../../utils/testUtils';

jest.mock('@ethersproject/contracts');

describe('fetchPools', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockedMulticallContract: jest.Mock;

  describe('when provider call fails', () => {
    it('should throw ProviderCallError', async () => {
      (Contract as unknown as jest.Mock).mockImplementationOnce(
        () => ({
          callStatic: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            multicall: jest.fn().mockRejectedValue(new ProviderCallError('an rpc error message')),
          },
        }),
      );

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      await expect(fetchValidPools(
        multicallContract,
        [WETH_TEST_CHAIN, IMX_TEST_CHAIN],
        [],
        TEST_V3_CORE_FACTORY_ADDRESS,
      )).rejects.toThrow(new ProviderCallError('failed multicall: an rpc error message'));
    });
  });

  describe('when a pool has no liquidity or price result', () => {
    it('should not include the pool in results', async () => {
      const slot0MockResults = {
        returnData: [
          {
            returnData: '0x',
          },
          {
            returnData: '0x',
          },
          {
            returnData: '0x',
          },
          {
            returnData: '0x',
          },
        ],
      };

      const liquiditiesMockResult = {
        returnData: [
          {
            returnData: '0x',
          },
          {
            returnData: '0x',
          },
          {
            returnData: '0x',
          },
          {
            returnData: '0x',
          },
        ],
      };

      // There will be 4 pool addresses when given a pair of tokens with no common routing tokens
      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest
            .fn()
            .mockResolvedValueOnce(slot0MockResults)
            .mockResolvedValueOnce(liquiditiesMockResult),
        },
      }));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_CHAIN, IMX_TEST_CHAIN],
        [],
        TEST_V3_CORE_FACTORY_ADDRESS,
      );

      expect(pools).toHaveLength(0);
    });
  });

  describe('when a pool has a 0 price or 0 liquidity', () => {
    it('should not include the pool in results', async () => {
      const slot0MockResults = {
        returnData: [
          {
            returnData: utils.defaultAbiCoder.encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [BigNumber.from(0), BigNumber.from(0), 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [BigNumber.from(0), BigNumber.from(0), 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [BigNumber.from(0), BigNumber.from(0), 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [BigNumber.from(0), BigNumber.from(0), 0, 1, 1, 0, true],
            ),
          },
        ],
      };

      const liquiditiesMockResult = {
        returnData: [
          {
            returnData: utils.defaultAbiCoder.encode(
              ['uint128'],
              [BigNumber.from(0)],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              ['uint128'],
              [BigNumber.from(0)],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              ['uint128'],
              [BigNumber.from(0)],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              ['uint128'],
              [BigNumber.from(0)],
            ),
          },
        ],
      };

      // There will be 4 pool addresses when given a pair of tokens with no common routing tokens
      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest
            .fn()
            .mockResolvedValueOnce(slot0MockResults)
            .mockResolvedValueOnce(liquiditiesMockResult),
        },
      }));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_CHAIN, IMX_TEST_CHAIN],
        [],
        TEST_V3_CORE_FACTORY_ADDRESS,
      );

      expect(pools).toHaveLength(0);
    });
  });

  describe('when there are multiple valid pools', () => {
    it('should map the pool details to the correct pool address', async () => {
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);

      const slot0MockResults = {
        returnData: [
          {
            returnData: utils.defaultAbiCoder.encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [sqrtPriceAtTick.toString(), arbitraryTick, 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [sqrtPriceAtTick.toString(), arbitraryTick, 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [sqrtPriceAtTick.toString(), arbitraryTick, 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [sqrtPriceAtTick.toString(), arbitraryTick, 0, 1, 1, 0, true],
            ),
          },
        ],
      };

      const liquiditiesMockResult = {
        returnData: [
          {
            returnData: utils.defaultAbiCoder.encode(
              ['uint128'],
              [BigNumber.from(1000000)],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              ['uint128'],
              [BigNumber.from(1000000)],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              ['uint128'],
              [BigNumber.from(1000000)],
            ),
          },
          {
            returnData: utils.defaultAbiCoder.encode(
              ['uint128'],
              [BigNumber.from(1000000)],
            ),
          },
        ],
      };

      // There will be 4 pool addresses when given a pair of tokens with no common routing tokens
      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest
            .fn()
            .mockResolvedValueOnce(slot0MockResults)
            .mockResolvedValueOnce(liquiditiesMockResult),
        },
      }));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_CHAIN, IMX_TEST_CHAIN],
        [],
        TEST_V3_CORE_FACTORY_ADDRESS,
      );

      expect(pools).toHaveLength(4);
    });
  });
});
