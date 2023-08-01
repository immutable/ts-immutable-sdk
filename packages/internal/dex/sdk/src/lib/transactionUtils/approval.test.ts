import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { TEST_FROM_ADDRESS, TEST_PERIPHERY_ROUTER_ADDRESS, WETH_TEST_TOKEN } from 'test/utils';
import { Contract } from '@ethersproject/contracts';
import { ERC20__factory } from 'contracts/types/factories/ERC20__factory';
import { ApproveError } from 'errors';
import { BytesLike } from '@ethersproject/bytes';
import { ethers } from 'ethers';
import { getApproveGasEstimate, getApproveTransaction } from './approval';

jest.mock('@ethersproject/providers');
jest.mock('@ethersproject/contracts');

// Mock the ERC20 token contract address and allowance values
const spenderAddress = TEST_PERIPHERY_ROUTER_ADDRESS;
const fromAddress = TEST_FROM_ADDRESS;
const existingAllowance = BigNumber.from('1000000000000000000');
const tokenInAmount = BigNumber.from('2000000000000000000');

describe('getApprovalTransaction', () => {
  describe('when the allowance is greater than the given amount', () => {
    it('should return null', async () => {
      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(
        () => ({
          allowance: jest.fn().mockResolvedValue(existingAllowance),
        }),
      );
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          connect: jest.fn().mockResolvedValue(erc20Contract),
        }),
      ) as unknown as JsonRpcProvider;

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
        WETH_TEST_TOKEN.address,
        BigNumber.from('100000000000000000'),
        spenderAddress,
      );
      expect(result).toBeNull();
      expect(erc20Contract.mock.calls.length).toEqual(1);
    });
  });

  describe('when the allowance is less than the given amount', () => {
    it('should create an unsigned approve transaction with the difference as the amount to approve', async () => {
      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(
        () => ({
          allowance: jest.fn().mockResolvedValue(BigNumber.from('1000000000000000000')),
        }),
      );
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          connect: jest.fn().mockResolvedValue(erc20Contract),
        }),
      ) as unknown as JsonRpcProvider;

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

      const expectedAmountToApprove = tokenInAmount.sub(existingAllowance);

      const result = await getApproveTransaction(
        provider,
        TEST_FROM_ADDRESS,
        WETH_TEST_TOKEN.address,
        tokenInAmount,
        spenderAddress,
      );

      expect(result).not.toBeNull();
      expect(result?.data).not.toBeNull();
      expect(result?.to).toEqual(WETH_TEST_TOKEN.address);
      expect(result?.from).toEqual(TEST_FROM_ADDRESS);
      expect(result?.value).toEqual(0); // we do not want to send any ETH

      const erc20ContractInterface = ERC20__factory.createInterface();
      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', result?.data as BytesLike);
      expect(decodedResults[0]).toEqual(TEST_PERIPHERY_ROUTER_ADDRESS);
      expect(decodedResults[1].toString()).toEqual(expectedAmountToApprove.toString());
      expect(erc20Contract.mock.calls.length).toEqual(1);
    });
  });

  describe('when the allowance is 0', () => {
    it('should return the input amount', async () => {
      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(
        () => ({
          allowance: jest.fn().mockResolvedValue(BigNumber.from('0')),
        }),
      );
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          connect: jest.fn().mockResolvedValue(erc20Contract),
        }),
      ) as unknown as JsonRpcProvider;

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
        WETH_TEST_TOKEN.address,
        tokenInAmount,
        spenderAddress,
      );

      const erc20ContractInterface = ERC20__factory.createInterface();
      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', result?.data as BytesLike);

      expect(decodedResults[1].toString()).toEqual(tokenInAmount.toString());
    });

    describe('when the allowance rpc call fails', () => {
      it('should throw an ApproveError', async () => {
        const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(
          () => ({
            allowance: jest.fn().mockRejectedValue(new Error('an rpc error')),
          }),
        );
        const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
          () => ({
            connect: jest.fn().mockResolvedValue(erc20Contract),
          }),
        ) as unknown as JsonRpcProvider;

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

        await expect(getApproveTransaction(
          provider,
          TEST_FROM_ADDRESS,
          WETH_TEST_TOKEN.address,
          tokenInAmount,
          spenderAddress,
        ))
          .rejects.toThrow(new ApproveError('failed to get allowance: an rpc error'));
      });
    });
  });

  describe("when the owner's address is the same as the spender's address", () => {
    it('should throw an ApproveError', async () => {
      const amount = BigNumber.from('2000000000000000000');

      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(
        () => ({
          allowance: jest.fn().mockResolvedValue(BigNumber.from('0')),
        }),
      );
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          connect: jest.fn().mockResolvedValue(erc20Contract),
        }),
      ) as unknown as JsonRpcProvider;

      await expect(() => getApproveTransaction(
        provider,
        spenderAddress,
        WETH_TEST_TOKEN.address,
        amount,
        spenderAddress,
      )).rejects.toThrow(new ApproveError('owner and spender addresses are the same'));
    });
  });
});

describe('getApproveGasEstimate', () => {
  describe('when given valid arguments', () => {
    it('should include the fromAddress when estimating gas for approval', async () => {
      const approveGasEstimate = BigNumber.from('100000');
      const approveMock = jest.fn().mockResolvedValue(approveGasEstimate);

      const erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(
        () => ({
          estimateGas: { approve: approveMock },
        }),
      );
      const provider = (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          connect: jest.fn().mockResolvedValue(erc20Contract),
        }),
      ) as unknown as JsonRpcProvider;

      await getApproveGasEstimate(
        provider,
        fromAddress,
        spenderAddress,
        WETH_TEST_TOKEN.address,
      );
      expect(approveMock).toHaveBeenCalledWith(spenderAddress, ethers.constants.MaxUint256, {
        from: fromAddress,
      });
    });
  });
});
