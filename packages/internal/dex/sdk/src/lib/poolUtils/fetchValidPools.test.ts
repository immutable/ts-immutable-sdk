import { TickMath } from '@uniswap/v3-sdk';
import { Contract, JsonRpcProvider, AbiCoder } from 'ethers';
import { ProviderCallError } from '../../errors';
import { fetchValidPools } from './fetchValidPools';
import { Multicall__factory } from '../../contracts/types';
import {
  IMX_TEST_TOKEN,
  TEST_CHAIN_ID,
  TEST_MULTICALL_ADDRESS,
  TEST_RPC_URL,
  TEST_V3_CORE_FACTORY_ADDRESS,
  WETH_TEST_TOKEN,
} from '../../test/utils';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}));

describe('fetchPools', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockedMulticallContract: jest.Mock;

  describe('when provider call fails', () => {
    it('should throw ProviderCallError', async () => {
      (Contract as unknown as jest.Mock).mockImplementationOnce(
        () => ({
          multicall: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            staticCall: jest.fn().mockRejectedValue(new ProviderCallError('an rpc error message')),
          },
        }),
      );

      const provider = new JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      await expect(fetchValidPools(
        multicallContract,
        [WETH_TEST_TOKEN, IMX_TEST_TOKEN],
        [],
        TEST_V3_CORE_FACTORY_ADDRESS,
        'latest',
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
        multicall: {
          staticCall: jest
            .fn()
            .mockResolvedValueOnce(slot0MockResults)
            .mockResolvedValueOnce(liquiditiesMockResult),
        },
      }));

      const provider = new JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_TOKEN, IMX_TEST_TOKEN],
        [],
        TEST_V3_CORE_FACTORY_ADDRESS,
        'latest',
      );

      expect(pools).toHaveLength(0);
    });
  });

  describe('when a pool has a 0 price or 0 liquidity', () => {
    it('should not include the pool in results', async () => {
      const slot0MockResults = {
        returnData: [
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [BigInt(0), BigInt(0), 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [BigInt(0), BigInt(0), 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [BigInt(0), BigInt(0), 0, 1, 1, 0, true],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              [
                'uint160',
                'int24',
                'uint16',
                'uint16',
                'uint16',
                'uint8',
                'bool',
              ],
              [BigInt(0), BigInt(0), 0, 1, 1, 0, true],
            ),
          },
        ],
      };

      const liquiditiesMockResult = {
        returnData: [
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              ['uint128'],
              [BigInt(0)],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              ['uint128'],
              [BigInt(0)],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              ['uint128'],
              [BigInt(0)],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              ['uint128'],
              [BigInt(0)],
            ),
          },
        ],
      };

      // There will be 4 pool addresses when given a pair of tokens with no common routing tokens
      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        multicall: {
          staticCall: jest
            .fn()
            .mockResolvedValueOnce(slot0MockResults)
            .mockResolvedValueOnce(liquiditiesMockResult),
        },
      }));

      const provider = new JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_TOKEN, IMX_TEST_TOKEN],
        [],
        TEST_V3_CORE_FACTORY_ADDRESS,
        'latest',
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
            returnData: AbiCoder.defaultAbiCoder().encode(
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
            returnData: AbiCoder.defaultAbiCoder().encode(
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
            returnData: AbiCoder.defaultAbiCoder().encode(
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
            returnData: AbiCoder.defaultAbiCoder().encode(
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
            returnData: AbiCoder.defaultAbiCoder().encode(
              ['uint128'],
              [BigInt(1000000)],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              ['uint128'],
              [BigInt(1000000)],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              ['uint128'],
              [BigInt(1000000)],
            ),
          },
          {
            returnData: AbiCoder.defaultAbiCoder().encode(
              ['uint128'],
              [BigInt(1000000)],
            ),
          },
        ],
      };

      // There will be 4 pool addresses when given a pair of tokens with no common routing tokens
      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        multicall: {
          staticCall: jest
            .fn()
            .mockResolvedValueOnce(slot0MockResults)
            .mockResolvedValueOnce(liquiditiesMockResult),
        },
      }));

      const provider = new JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_TOKEN, IMX_TEST_TOKEN],
        [],
        TEST_V3_CORE_FACTORY_ADDRESS,
        'latest',
      );

      expect(pools).toHaveLength(4);
    });
  });
});
