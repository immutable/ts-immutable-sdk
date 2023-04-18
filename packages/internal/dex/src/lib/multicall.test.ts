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
import { Multicall__factory } from '../contracts/types';
import { DEFAULT_GAS_QUOTE } from './getQuotesForRoutes';
import { MockProvider } from 'utils/mockProvider';

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

      const iface = Multicall__factory.createInterface();
      const provider = new MockProvider();
      provider.mock(
        MULTICALL_ADDRESS_CREATE2,
        'multicall((address,uint256,bytes)[])',
        iface.encodeFunctionResult('multicall', [
          ethers.BigNumber.from(42),
          [
            [true, 2, returnData],
            [true, 4, returnData],
          ],
        ])
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
    });
  });

  describe('when call slot0 on multiple pools', () => {
    it.skip('returns the result', async () => {
      const returnData = defaultAbiCoder.encode(
        ['address', 'address', 'uint24'],
        [WETH_TEST_CHAIN.address, IMX_TEST_CHAIN.address, '10000']
      );
      const coreFactoryV3 = V3_CORE_FACTORY_ADDRESS_CREATE2;
      const addr = getCreate2Address(
        coreFactoryV3,
        keccak256(['bytes'], [returnData]),
        POOL_INIT_CODE_HASH
      );
      const addresses = [addr];
      const iface = Multicall__factory.createInterface();
      const provider = new MockProvider();
      provider.mock(
        MULTICALL_ADDRESS_CREATE2,
        'multicall((address,uint256,bytes)[])',
        iface.encodeFunctionResult('multicall', [
          ethers.BigNumber.from(42),
          [
            [true, 2, returnData],
            [true, 4, returnData],
          ],
        ])
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
      const decodedSlot0 = ethers.utils.defaultAbiCoder.decode(
        ['uint160', 'int24', 'uint16', 'uint16', 'uint16', 'uint8', 'bool'],
        encodedSlot0
      );

      // 1<<96
      const sqrtPriceX96 = ethers.BigNumber.from(decodedSlot0[0]);
      const two = ethers.BigNumber.from('2');
      const oneNineTwo = ethers.BigNumber.from('192');
      const priceX96 = sqrtPriceX96.mul(sqrtPriceX96);
      const price = priceX96.div(two.pow(oneNineTwo));
      console.log(price.toString());
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

      const iface = Multicall__factory.createInterface();
      const provider = new MockProvider();
      provider.mock(
        MULTICALL_ADDRESS_CREATE2,
        'multicall((address,uint256,bytes)[])',
        iface.encodeFunctionResult('multicall', [
          ethers.BigNumber.from(42),
          [
            [true, 2, returnData],
            [true, 4, returnData],
          ],
        ])
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
    });
  });
});
