import { TradeType } from '@uniswap/sdk-core';
import { Contract, JsonRpcProvider, MaxUint256 } from 'ethers';
import {
  expectToBeDefined,
  FUN_TEST_TOKEN,
  NATIVE_TEST_TOKEN,
  newAmountFromString,
  TEST_FROM_ADDRESS,
  TEST_ROUTER_ADDRESS,
  TEST_SWAP_PROXY_ADDRESS,
  WETH_TEST_TOKEN,
} from '../../test/utils';
import { ERC20__factory } from '../../contracts/types/factories/ERC20__factory';
import { ApproveError } from '../../errors';
import { SecondaryFee } from '../../types';
import { getApproveGasEstimate, getApproveTransaction, prepareApproval } from './approval';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
  JsonRpcProvider: jest.fn(),
}));

// Mock the ERC20 token contract address and allowance values
const spenderAddress = TEST_ROUTER_ADDRESS;
const fromAddress = TEST_FROM_ADDRESS;
const existingAllowance = BigInt('1000000000000000000');
const tokenInAmount = newAmountFromString('2', WETH_TEST_TOKEN);

describe('getApprovalTransaction', () => {
  describe('when the allowance is greater than the given amount', () => {
    it('should return null', async () => {
      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
        allowance: jest.fn().mockResolvedValue(existingAllowance),
      }));
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(erc20Contract),
      })) as unknown as JsonRpcProvider;

      // Mock the ERC20 contract factory
      const erc20ContractFactory = {
        connect: jest.fn().mockReturnValue(erc20Contract),
      };

      // Mock the typechain generated contract factory
      jest.mock('../../contracts/types/factories/ERC20__factory', () => ({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ERC20__factory: erc20ContractFactory,
      }));

      // Mock the contract instance creation
      erc20ContractFactory.connect.mockReturnValue(erc20Contract);

      const result = await getApproveTransaction(
        provider,
        TEST_FROM_ADDRESS,
        newAmountFromString('1', WETH_TEST_TOKEN),
        spenderAddress,
      );
      expect(result).toBeNull();
      expect(erc20Contract.mock.calls.length).toEqual(1);
    });
  });

  describe('when the allowance is less than the given amount', () => {
    it('should create an unsigned approve transaction with the full amount of the input token', async () => {
      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
        allowance: jest.fn().mockResolvedValue(BigInt('1000000000000000000')),
      }));
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(erc20Contract),
      })) as unknown as JsonRpcProvider;

      // Mock the ERC20 contract factory
      const erc20ContractFactory = {
        connect: jest.fn().mockReturnValue(erc20Contract),
      };

      // Mock the typechain generated contract factory
      jest.mock('../../contracts/types/factories/ERC20__factory', () => ({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ERC20__factory: erc20ContractFactory,
      }));

      // Mock the contract instance creation
      erc20ContractFactory.connect.mockReturnValue(erc20Contract);

      const result = await getApproveTransaction(provider, TEST_FROM_ADDRESS, tokenInAmount, spenderAddress);

      expectToBeDefined(result?.data);
      expect(result.to).toEqual(WETH_TEST_TOKEN.address);
      expect(result.from).toEqual(TEST_FROM_ADDRESS);
      expect(result.value).toEqual(0); // we do not want to send any ETH

      const erc20ContractInterface = ERC20__factory.createInterface();
      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', result.data);
      expect(decodedResults[0]).toEqual(TEST_ROUTER_ADDRESS);
      expect(decodedResults[1].toString()).toEqual(tokenInAmount.value.toString());
      expect(erc20Contract.mock.calls.length).toEqual(1);
    });
  });

  describe('when the allowance is 0', () => {
    it('should return the input amount', async () => {
      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
        allowance: jest.fn().mockResolvedValue(BigInt('0')),
      }));
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(erc20Contract),
      })) as unknown as JsonRpcProvider;

      // Mock the ERC20 contract factory
      const erc20ContractFactory = {
        connect: jest.fn().mockReturnValue(erc20Contract),
      };

      // Mock the typechain generated contract factory
      jest.mock('../../contracts/types/factories/ERC20__factory', () => ({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ERC20__factory: erc20ContractFactory,
      }));

      // Mock the contract instance creation
      erc20ContractFactory.connect.mockReturnValue(erc20Contract);

      const result = await getApproveTransaction(provider, TEST_FROM_ADDRESS, tokenInAmount, spenderAddress);
      expectToBeDefined(result?.data);

      const erc20ContractInterface = ERC20__factory.createInterface();
      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', result.data);

      expect(decodedResults[1].toString()).toEqual(tokenInAmount.value.toString());
    });

    describe('when the allowance rpc call fails', () => {
      it('should throw an ApproveError', async () => {
        const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
          allowance: jest.fn().mockRejectedValue(new Error('an rpc error')),
        }));
        const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
          connect: jest.fn().mockResolvedValue(erc20Contract),
        })) as unknown as JsonRpcProvider;

        // Mock the ERC20 contract factory
        const erc20ContractFactory = {
          connect: jest.fn().mockReturnValue(erc20Contract),
        };

        // Mock the typechain generated contract factory
        jest.mock('../../contracts/types/factories/ERC20__factory', () => ({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ERC20__factory: erc20ContractFactory,
        }));

        // Mock the contract instance creation
        erc20ContractFactory.connect.mockReturnValue(erc20Contract);

        await expect(getApproveTransaction(provider, TEST_FROM_ADDRESS, tokenInAmount, spenderAddress)).rejects.toThrow(
          new ApproveError('failed to get allowance: an rpc error'),
        );
      });
    });
  });

  describe("when the owner's address is the same as the spender's address", () => {
    it('should throw an ApproveError', async () => {
      const amount = newAmountFromString('2', WETH_TEST_TOKEN);

      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
        allowance: jest.fn().mockResolvedValue(BigInt('0')),
      }));
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(erc20Contract),
      })) as unknown as JsonRpcProvider;

      await expect(() => getApproveTransaction(provider, spenderAddress, amount, spenderAddress)).rejects.toThrow(
        new ApproveError('owner and spender addresses are the same'),
      );
    });
  });
});

describe('getApproveGasEstimate', () => {
  describe('when given valid arguments', () => {
    it('should include the fromAddress when estimating gas for approval', async () => {
      const approveGasEstimate = BigInt('100000');
      const approveMock = jest.fn().mockResolvedValue(approveGasEstimate);

      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(() => ({
        estimateGas: { approve: approveMock },
      }));
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(erc20Contract),
      })) as unknown as JsonRpcProvider;

      await getApproveGasEstimate(provider, fromAddress, spenderAddress, WETH_TEST_TOKEN.address);
      expect(approveMock).toHaveBeenCalledWith(spenderAddress, MaxUint256, {
        from: fromAddress,
      });
    });
  });
});

describe('prepareApproval', () => {
  describe('when the input token is native and the trade is EXACT_INPUT', () => {
    it('should return null', () => {
      const amountSpecified = newAmountFromString('1', NATIVE_TEST_TOKEN);
      const amountWithSlippage = newAmountFromString('2', FUN_TEST_TOKEN);
      const secondaryFees = [{ basisPoints: 0, recipient: TEST_FROM_ADDRESS }];
      const approval = prepareApproval(
        TradeType.EXACT_INPUT,
        amountSpecified, // token in
        amountWithSlippage,
        {
          routerAddress: TEST_ROUTER_ADDRESS,
          secondaryFeeAddress: TEST_SWAP_PROXY_ADDRESS,
        },
        secondaryFees,
      );

      expect(approval).toBeNull();
    });
  });

  describe('when the input token is native and the trade is EXACT_OUTPUT', () => {
    it('should return null', () => {
      const amountSpecified = newAmountFromString('1', FUN_TEST_TOKEN);
      const amountWithSlippage = newAmountFromString('2', NATIVE_TEST_TOKEN);
      const secondaryFees = [{ basisPoints: 0, recipient: TEST_FROM_ADDRESS }];
      const approval = prepareApproval(
        TradeType.EXACT_OUTPUT,
        amountSpecified,
        amountWithSlippage, // token in
        {
          routerAddress: TEST_ROUTER_ADDRESS,
          secondaryFeeAddress: TEST_SWAP_PROXY_ADDRESS,
        },
        secondaryFees,
      );

      expect(approval).toBeNull();
    });
  });

  describe('when exact input amount is specified', () => {
    it('uses the amount specified by the user', () => {
      const amountSpecified = newAmountFromString('1', WETH_TEST_TOKEN);
      const amountWithSlippage = newAmountFromString('2', WETH_TEST_TOKEN);
      const secondaryFees = [{ basisPoints: 0, recipient: TEST_FROM_ADDRESS }];
      const approval = prepareApproval(
        TradeType.EXACT_INPUT,
        amountSpecified,
        amountWithSlippage,
        {
          routerAddress: TEST_ROUTER_ADDRESS,
          secondaryFeeAddress: TEST_SWAP_PROXY_ADDRESS,
        },
        secondaryFees,
      );
      expect(approval).not.toBeNull();
      expect(approval?.amount).toEqual(amountSpecified);
    });
  });

  describe('when exact output amount is specified', () => {
    it('uses the amount calculated with slippage', () => {
      const amountSpecified = newAmountFromString('1', WETH_TEST_TOKEN);
      const amountWithSlippage = newAmountFromString('2', WETH_TEST_TOKEN);
      const secondaryFees = [{ basisPoints: 0, recipient: TEST_FROM_ADDRESS }];
      const approval = prepareApproval(
        TradeType.EXACT_OUTPUT,
        amountSpecified,
        amountWithSlippage,
        {
          routerAddress: TEST_ROUTER_ADDRESS,
          secondaryFeeAddress: TEST_SWAP_PROXY_ADDRESS,
        },
        secondaryFees,
      );
      expect(approval).not.toBeNull();
      expect(approval?.amount).toEqual(amountWithSlippage);
    });
  });

  describe('when secondary fees are specified', () => {
    it('uses the secondary fee address as the spender', () => {
      const amountSpecified = newAmountFromString('2', WETH_TEST_TOKEN);
      const amountWithSlippage = newAmountFromString('2', WETH_TEST_TOKEN);
      const secondaryFees = [{ basisPoints: 0, recipient: TEST_FROM_ADDRESS }];
      const approval = prepareApproval(
        TradeType.EXACT_OUTPUT,
        amountSpecified,
        amountWithSlippage,
        {
          routerAddress: TEST_ROUTER_ADDRESS,
          secondaryFeeAddress: TEST_SWAP_PROXY_ADDRESS,
        },
        secondaryFees,
      );
      expect(approval).not.toBeNull();
      expect(approval?.spender).toEqual(TEST_SWAP_PROXY_ADDRESS);
    });
  });

  describe('when no secondary fees are specified', () => {
    it('uses the periphery router address as the spender', () => {
      const amountSpecified = newAmountFromString('1', WETH_TEST_TOKEN);
      const amountWithSlippage = newAmountFromString('2', WETH_TEST_TOKEN);
      const secondaryFees: SecondaryFee[] = [];
      const approval = prepareApproval(
        TradeType.EXACT_OUTPUT,
        amountSpecified,
        amountWithSlippage,
        {
          routerAddress: TEST_ROUTER_ADDRESS,
          secondaryFeeAddress: TEST_SWAP_PROXY_ADDRESS,
        },
        secondaryFees,
      );
      expect(approval).not.toBeNull();
      expect(approval?.spender).toEqual(TEST_ROUTER_ADDRESS);
    });
  });
});
