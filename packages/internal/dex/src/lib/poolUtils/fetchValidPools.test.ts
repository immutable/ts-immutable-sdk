import { describe, it } from '@jest/globals';
import { BigNumber, ethers } from 'ethers';
import { fetchValidPools } from './fetchValidPools';
import { TickMath } from '@uniswap/v3-sdk';
import {
  Multicall__factory,
  UniswapV3Pool__factory,
} from '../../contracts/types';
import {
  IMX_TEST_CHAIN,
  TEST_CHAIN_ID,
  TEST_RPC_URL,
  WETH_TEST_CHAIN,
} from '../../utils/testUtils';
import { MULTICALL_ADDRESS_CREATE2 } from '../../constants';
import { MockProvider } from 'utils/mockProvider';

describe('fetchPools', () => {
  describe('when a pool has no liquidity or price result', () => {
    it('should not include the pool in results', async () => {
      const slot0ReturnData = '0x';
      const liquiditiesReturnData = '0x';

      const provider = new MockProvider();
      provider.mockOnce(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
          ],
        ]
      );
      provider.mockOnce(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
          ],
        ]
      );
      const multicallContract = Multicall__factory.connect(
        MULTICALL_ADDRESS_CREATE2,
        provider
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_CHAIN, IMX_TEST_CHAIN],
        []
      );

      expect(pools).toHaveLength(0);
    });
  });

  describe('when a pool has a 0 price or 0 liquidity', () => {
    it('should not include the pool in results', async () => {
      const slot0ReturnData =
        UniswapV3Pool__factory.createInterface().encodeFunctionResult('slot0', [
          BigNumber.from(0),
          BigNumber.from(0),
          0,
          1,
          1,
          0,
          true,
        ]);

      const liquiditiesReturnData =
        UniswapV3Pool__factory.createInterface().encodeFunctionResult(
          'liquidity',
          [BigNumber.from(0)]
        );

      const provider = new MockProvider();
      provider.mockOnce(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
          ],
        ]
      );
      provider.mockOnce(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
          ],
        ]
      );
      const multicallContract = Multicall__factory.connect(
        MULTICALL_ADDRESS_CREATE2,
        provider
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_CHAIN, IMX_TEST_CHAIN],
        []
      );

      expect(pools).toHaveLength(0);
    });
  });

  describe('when there are multiple valid pools', () => {
    it('should map the pool details to the correct pool address', async () => {
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);

      const slot0ReturnData =
        UniswapV3Pool__factory.createInterface().encodeFunctionResult('slot0', [
          sqrtPriceAtTick.toString(),
          arbitraryTick,
          0,
          1,
          1,
          0,
          true,
        ]);

      const liquiditiesReturnData =
        UniswapV3Pool__factory.createInterface().encodeFunctionResult(
          'liquidity',
          [BigNumber.from(1000000)]
        );

      const provider = new MockProvider();
      provider.mockOnce(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
          ],
        ]
      );
      provider.mockOnce(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
            [true, ethers.BigNumber.from(2), liquiditiesReturnData],
          ],
        ]
      );

      const multicallContract = Multicall__factory.connect(
        MULTICALL_ADDRESS_CREATE2,
        provider
      );

      const pools = await fetchValidPools(
        multicallContract,
        [WETH_TEST_CHAIN, IMX_TEST_CHAIN],
        []
      );

      expect(pools).toHaveLength(4);
    });
  });
});
