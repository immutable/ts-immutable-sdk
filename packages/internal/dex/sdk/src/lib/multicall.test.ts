import { Contract, getCreate2Address, JsonRpcProvider, keccak256, AbiCoder } from 'ethers';
import {
  multicallSingleCallDataMultipleContracts,
  multicallMultipleCallDataSingContract,
} from './multicall';
import {
  IMX_TEST_TOKEN,
  TEST_CHAIN_ID,
  TEST_MULTICALL_ADDRESS,
  TEST_RPC_URL,
  TEST_V3_CORE_FACTORY_ADDRESS,
  USDC_TEST_TOKEN,
  WETH_TEST_TOKEN,
} from '../test/utils';
import { Multicall__factory } from '../contracts/types';

const token0 = 'token0';
const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}));

describe('multicallSingleCallDataMultipleContracts', () => {
  let mockedContract: jest.Mock;
  beforeEach(() => {
    mockedContract = (Contract as unknown as jest.Mock).mockImplementationOnce(
      () => ({
        multicall: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          staticCall: async () => ({
            returnData: [
              {
                returnData: AbiCoder.defaultAbiCoder().encode(
                  ['address'],
                  [WETH_TEST_TOKEN.address],
                ),
              },
              {
                returnData: AbiCoder.defaultAbiCoder().encode(
                  ['address'],
                  [WETH_TEST_TOKEN.address],
                ),
              },
            ],
          }),
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
          AbiCoder.defaultAbiCoder().encode(
            ['address', 'address', 'uint24'],
            [WETH_TEST_TOKEN.address, IMX_TEST_TOKEN.address, '3000'],
          ),
        ),
        POOL_INIT_CODE_HASH,
      );
      const addrToken0: string = getCreate2Address(
        coreFactoryV3,
        keccak256(
          AbiCoder.defaultAbiCoder().encode(
            ['address', 'address', 'uint24'],
            [WETH_TEST_TOKEN.address, IMX_TEST_TOKEN.address, '10000'],
          ),
        ),
        POOL_INIT_CODE_HASH,
      );

      const addresses = [addr, addrToken0];
      const provider = new JsonRpcProvider(
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
      const decodedToken0First = AbiCoder.defaultAbiCoder().decode(
        ['address'],
        encodedToken0First,
      )[0];
      const decodedToken0Second = AbiCoder.defaultAbiCoder().decode(
        ['address'],
        encodedToken0Second,
      )[0];

      expect(decodedToken0First === IMX_TEST_TOKEN);
      expect(decodedToken0Second === WETH_TEST_TOKEN);
      expect(mockedContract).toBeCalledTimes(1);
    });
  });
});

describe('multicallMultipleCallDataSingContract', () => {
  let mockedContract: jest.Mock;
  beforeEach(() => {
    mockedContract = (Contract as unknown as jest.Mock).mockImplementation(
      () => ({
        multicall: {
          // TODO fix
          // eslint-disable-next-line no-promise-executor-return, @typescript-eslint/no-unused-vars
          staticCall: async () => ({
            returnData: [
              {
                returnData: AbiCoder.defaultAbiCoder().encode(
                  ['address'],
                  [WETH_TEST_TOKEN.address],
                ),
              },
              {
                returnData: AbiCoder.defaultAbiCoder().encode(
                  ['address'],
                  [WETH_TEST_TOKEN.address],
                ),
              },
            ],
          }),
        },
      }),
    );
  });

  describe('when multiple call data', () => {
    it('returns the result of each function call', async () => {
      const testCallData = [
        // eslint-disable-next-line max-len
        '0xc6a5026a0000000000000000000000004f062a3eaec3730560ab89b5ce5ac0ab2c5517ae00000000000000000000000093733225ccc07ba02b1449aa3379418ddc37f6ec000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000000',
        // eslint-disable-next-line max-len
        '0xc6a5026a0000000000000000000000004f062a3eaec3730560ab89b5ce5ac0ab2c5517ae00000000000000000000000093733225ccc07ba02b1449aa3379418ddc37f6ec000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000000',
      ];
      const coreFactoryV3 = TEST_V3_CORE_FACTORY_ADDRESS;
      const addrToken0: string = getCreate2Address(
        coreFactoryV3,
        keccak256(
          AbiCoder.defaultAbiCoder().encode(
            ['address', 'address', 'uint24'],
            [WETH_TEST_TOKEN.address, USDC_TEST_TOKEN.address, '10000'],
          ),
        ),
        POOL_INIT_CODE_HASH,
      );

      const provider = new JsonRpcProvider(
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
      );

      expect(result.returnData.length).toBe(2);
      expect(mockedContract).toBeCalledTimes(1);
    });
  });
});
