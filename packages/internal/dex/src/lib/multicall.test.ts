import { expect, describe, it } from '@jest/globals';
import {
  multicallSingleCallDataMultipleContracts,
  multicallMultipleCallDataSingContract,
} from '../lib/multicall';
import { ethers } from 'ethers';
import { getCreate2Address } from '@ethersproject/address';
import {
  MULTICALL_ADDRESS_CREATE2,
  V3_CORE_FACTORY_ADDRESS_CREATE2,
  V3_MIGRATOR_ADDRESSES_CREATE2,
} from '../constants/addresses';
import { keccak256 } from '@ethersproject/solidity';
import { defaultAbiCoder } from '@ethersproject/abi';
import {
  IMX_TEST_CHAIN,
  USDC_TEST_CHAIN,
  WETH_TEST_CHAIN,
} from '../utils/testUtils';
import { Multicall__factory, UniswapV3Pool__factory } from '../contracts/types';
import { DEFAULT_GAS_QUOTE } from './getQuotesForRoutes';
import { MockProvider } from 'utils/mockProvider';
import { TickMath } from '@uniswap/v3-sdk';

const slot0 = 'slot0';
const token0 = 'token0';
const POOL_INIT_CODE_HASH =
  '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54';

describe('callMultipleContractSingleData', () => {
  describe('when call token0 on multiple pools', () => {
    it('returns the result', async () => {
      const returnData = defaultAbiCoder.encode(
        ['address', 'address', 'uint24'],
        [WETH_TEST_CHAIN.address, IMX_TEST_CHAIN.address, '3000']
      );
      const addr = getCreate2Address(
        V3_CORE_FACTORY_ADDRESS_CREATE2,
        keccak256(['bytes'], [returnData]),
        POOL_INIT_CODE_HASH
      );

      const provider = new MockProvider();
      const mockedFn = provider.mock(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [
            [true, ethers.BigNumber.from(2), returnData],
            [true, ethers.BigNumber.from(2), returnData],
          ],
        ]
      );

      const multicallContract = Multicall__factory.connect(
        MULTICALL_ADDRESS_CREATE2,
        provider
      );

      const result = await multicallSingleCallDataMultipleContracts(
        multicallContract,
        token0,
        [addr, addr]
      );

      const encodedToken0First = result.returnData[0].returnData;
      const encodedToken0Second = result.returnData[1].returnData;
      const decodedToken0First = ethers.utils.defaultAbiCoder.decode(
        ['address'],
        encodedToken0First
      )[0];
      const decodedToken0Second = ethers.utils.defaultAbiCoder.decode(
        ['address'],
        encodedToken0Second
      )[0];

      expect(decodedToken0First === IMX_TEST_CHAIN);
      expect(decodedToken0Second === WETH_TEST_CHAIN);
      expect(mockedFn).toBeCalledTimes(1);
    });
  });

  describe('when call slot0 on multiple pools', () => {
    it('returns the result', async () => {
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
      const coreFactoryV3 = V3_CORE_FACTORY_ADDRESS_CREATE2;
      const addr = getCreate2Address(
        coreFactoryV3,
        keccak256(['bytes'], [slot0ReturnData]),
        POOL_INIT_CODE_HASH
      );
      const addresses = [addr];
      const provider = new MockProvider();
      provider.mock(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [
            [true, ethers.BigNumber.from(2), slot0ReturnData],
            [true, ethers.BigNumber.from(2), slot0ReturnData],
          ],
        ]
      );
      const multicallContract = Multicall__factory.connect(
        MULTICALL_ADDRESS_CREATE2,
        provider
      );

      const result = await multicallSingleCallDataMultipleContracts(
        multicallContract,
        slot0,
        addresses
      );

      const encodedSlot0 = result.returnData[0].returnData;
      const decodedSlot0 =
        UniswapV3Pool__factory.createInterface().decodeFunctionResult(
          'slot0',
          encodedSlot0
        );

      // 1<<96
      const sqrtPriceX96 = ethers.BigNumber.from(decodedSlot0[0]);
      const two = ethers.BigNumber.from('2');
      const oneNineTwo = ethers.BigNumber.from('192');
      const priceX96 = sqrtPriceX96.mul(sqrtPriceX96);
      const price = priceX96.div(two.pow(oneNineTwo));
      expect(price.toString()).toEqual('1');
    });
  });
});

describe('callSingleContractWithCallData', () => {
  describe('when something happens', () => {
    it('has this result', async () => {
      const returnData = defaultAbiCoder.encode(
        ['address', 'address', 'uint24'],
        [WETH_TEST_CHAIN.address, USDC_TEST_CHAIN.address, '10000']
      );
      const testCallData = [
        '0xc6a5026a0000000000000000000000004f062a3eaec3730560ab89b5ce5ac0ab2c5517ae00000000000000000000000093733225ccc07ba02b1449aa3379418ddc37f6ec000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000000',
      ];
      const coreFactoryV3 = V3_MIGRATOR_ADDRESSES_CREATE2;
      const addrToken0: string = getCreate2Address(
        coreFactoryV3,
        keccak256(['bytes'], [returnData]),
        POOL_INIT_CODE_HASH
      );

      const provider = new MockProvider();
      const mockedFn = provider.mock(
        MULTICALL_ADDRESS_CREATE2,
        Multicall__factory.createInterface(),
        'multicall',
        [
          ethers.BigNumber.from(42),
          [[true, ethers.BigNumber.from(2), returnData]],
        ]
      );
      const multicallContract = Multicall__factory.connect(
        MULTICALL_ADDRESS_CREATE2,
        provider
      );

      const result = await multicallMultipleCallDataSingContract(
        multicallContract,
        testCallData,
        addrToken0,
        { gasRequired: DEFAULT_GAS_QUOTE }
      );
      expect(result.returnData.length).toBe(1);
      expect(mockedFn).toBeCalledTimes(1);
    });
  });
});
