import { expect, describe, it } from '@jest/globals';
import { ethers, providers } from 'ethers';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256 } from '@ethersproject/solidity';
import { defaultAbiCoder } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import {
  multicallSingleCallDataMultipleContracts,
  multicallMultipleCallDataSingContract,
} from './multicall';
import {
  IMX_TEST_CHAIN,
  TEST_CHAIN_ID,
  TEST_MULTICALL_ADDRESS,
  TEST_RPC_URL,
  TEST_V3_CORE_FACTORY_ADDRESS,
  USDC_TEST_CHAIN,
  WETH_TEST_CHAIN,
} from '../utils/testUtils';
import { Multicall__factory } from '../contracts/types';
import { DEFAULT_GAS_QUOTE } from './getQuotesForRoutes';

const slot0 = 'slot0';
const token0 = 'token0';
const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54';

jest.mock('@ethersproject/contracts');

describe('callMultipleContractSingleData', () => {
  let mockedContract: jest.Mock;
  beforeEach(() => {
    mockedContract = (Contract as unknown as jest.Mock).mockImplementation(
      () => ({
        callStatic: {
          multicall: () => new Promise((resolve, reject) => resolve({
            returnData: [
              {
                returnData: ethers.utils.defaultAbiCoder.encode(
                  ['address'],
                  [WETH_TEST_CHAIN.address],
                ),
              },
              {
                returnData: ethers.utils.defaultAbiCoder.encode(
                  ['address'],
                  [WETH_TEST_CHAIN.address],
                ),
              },
            ],
          })),
        },
      }),
    );
  });

  describe('when call token0 on multiple pools', () => {
    it('returns the result', async () => {
      const coreFactoryV3 = TEST_V3_CORE_FACTORY_ADDRESS;
      const addr: string = getCreate2Address(
        coreFactoryV3,
        keccak256(
          ['bytes'],
          [
            defaultAbiCoder.encode(
              ['address', 'address', 'uint24'],
              [WETH_TEST_CHAIN.address, IMX_TEST_CHAIN.address, '3000'],
            ),
          ],
        ),
        POOL_INIT_CODE_HASH,
      );
      const addrToken0: string = getCreate2Address(
        coreFactoryV3,
        keccak256(
          ['bytes'],
          [
            defaultAbiCoder.encode(
              ['address', 'address', 'uint24'],
              [WETH_TEST_CHAIN.address, IMX_TEST_CHAIN.address, '10000'],
            ),
          ],
        ),
        POOL_INIT_CODE_HASH,
      );

      const addresses = [addr, addrToken0];
      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const result = await multicallSingleCallDataMultipleContracts(
        multicallContract,
        token0,
        addresses,
      );

      const encodedToken0First = result.returnData[0].returnData;
      const encodedToken0Second = result.returnData[1].returnData;
      const decodedToken0First = ethers.utils.defaultAbiCoder.decode(
        ['address'],
        encodedToken0First,
      )[0];
      const decodedToken0Second = ethers.utils.defaultAbiCoder.decode(
        ['address'],
        encodedToken0Second,
      )[0];

      expect(decodedToken0First === IMX_TEST_CHAIN);
      expect(decodedToken0Second === WETH_TEST_CHAIN);
      expect(mockedContract).toBeCalledTimes(1);
    });
  });

  describe('Spot price calculation PoC', () => {
    it.skip('calculates', async () => {
      const coreFactoryV3 = TEST_V3_CORE_FACTORY_ADDRESS;
      const addr: string = getCreate2Address(
        coreFactoryV3,
        keccak256(
          ['bytes'],
          [
            defaultAbiCoder.encode(
              ['address', 'address', 'uint24'],
              [WETH_TEST_CHAIN.address, IMX_TEST_CHAIN.address, '10000'],
            ),
          ],
        ),
        POOL_INIT_CODE_HASH,
      );
      const addresses = [addr];
      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const result = await multicallSingleCallDataMultipleContracts(
        multicallContract,
        slot0,
        addresses,
      );

      const encodedSlot0 = result.returnData[0].returnData;
      const decodedSlot0 = ethers.utils.defaultAbiCoder.decode(
        ['uint160', 'int24', 'uint16', 'uint16', 'uint16', 'uint8', 'bool'],
        encodedSlot0,
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
  let mockedContract: jest.Mock;
  beforeEach(() => {
    mockedContract = (Contract as unknown as jest.Mock).mockImplementation(
      () => ({
        callStatic: {
          multicall: () => new Promise((resolve, reject) => resolve({
            returnData: [
              {
                returnData: ethers.utils.defaultAbiCoder.encode(
                  ['address'],
                  [WETH_TEST_CHAIN.address],
                ),
              },
            ],
          })),
        },
      }),
    );
  });

  describe('when something happens', () => {
    it('has this result', async () => {
      const testCallData = [
        '0xc6a5026a0000000000000000000000004f062a3eaec3730560ab89b5ce5ac0ab2c5517ae00000000000000000000000093733225ccc07ba02b1449aa3379418ddc37f6ec000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000000',
      ];
      const coreFactoryV3 = TEST_V3_CORE_FACTORY_ADDRESS;
      const addrToken0: string = getCreate2Address(
        coreFactoryV3,
        keccak256(
          ['bytes'],
          [
            defaultAbiCoder.encode(
              ['address', 'address', 'uint24'],
              [WETH_TEST_CHAIN.address, USDC_TEST_CHAIN.address, '10000'],
            ),
          ],
        ),
        POOL_INIT_CODE_HASH,
      );

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const result = await multicallMultipleCallDataSingContract(
        multicallContract,
        testCallData,
        addrToken0,
        { gasRequired: DEFAULT_GAS_QUOTE },
      );
      expect(result.returnData.length).toBe(1);
      expect(mockedContract).toBeCalledTimes(1);
    });
  });
});
