import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { TEST_FROM_ADDRESS, TEST_PERIPHERY_ROUTER_ADDRESS, WETH_TEST_CHAIN } from 'utils/testUtils';
import { Contract } from '@ethersproject/contracts';
import { ERC20__factory } from 'contracts/types/factories/ERC20__factory';
import { ApprovalError } from 'errors';
import { getERC20AmountToApprove, getUnsignedERC20ApproveTransaction } from './approval';

jest.mock('@ethersproject/providers');
jest.mock('@ethersproject/contracts');

// Mock the ERC20 token contract address and allowance values
const spenderAddress = TEST_PERIPHERY_ROUTER_ADDRESS;
const existingAllowance = BigNumber.from('1000000000000000000');
const tokenInAmount = BigNumber.from('2000000000000000000');

describe('getERC20AmountToApprove', () => {
  describe('when the allowance is greater than the given amount', () => {
    it('should return 0', async () => {
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

      const result = await getERC20AmountToApprove(
        provider,
        TEST_FROM_ADDRESS,
        WETH_TEST_CHAIN.address,
        BigNumber.from('100000000000000000'),
        spenderAddress,
      );

      expect(result.toString()).toEqual('0');
      expect(erc20Contract.mock.calls.length).toEqual(1);
    });
  });

  describe('when the allowance is greater than 0', () => {
    it('should calculate the correct amount to approve', async () => {
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

      const result = await getERC20AmountToApprove(
        provider,
        TEST_FROM_ADDRESS,
        WETH_TEST_CHAIN.address,
        tokenInAmount,
        spenderAddress,
      );

      // Calculate the expected amount to approve
      const expectedAmountToApprove = tokenInAmount.sub(existingAllowance);

      expect(result.toString()).toEqual(expectedAmountToApprove.toString());
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

      const result = await getERC20AmountToApprove(
        provider,
        TEST_FROM_ADDRESS,
        WETH_TEST_CHAIN.address,
        tokenInAmount,
        spenderAddress,
      );

      // Calculate the expected amount to approve
      const expectedAmountToApprove = tokenInAmount.sub(BigNumber.from('0'));

      expect(result.toString()).toEqual(expectedAmountToApprove.toString());
      expect(erc20Contract.mock.calls.length).toEqual(1);
    });

    describe('when the allowance rpc call fails', () => {
      it('should throw an ApprovalError', async () => {
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

        await expect(getERC20AmountToApprove(
          provider,
          TEST_FROM_ADDRESS,
          WETH_TEST_CHAIN.address,
          tokenInAmount,
          spenderAddress,
        ))
          .rejects.toThrow(new ApprovalError('failed to get allowance: an rpc error'));
      });
    });
  });

  describe('when the given amount is greater than the allowance', () => {
    it('should return 0', async () => {
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

      const result = await getERC20AmountToApprove(
        provider,
        TEST_FROM_ADDRESS,
        WETH_TEST_CHAIN.address,
        tokenInAmount,
        spenderAddress,
      );

      expect(result.toString()).toEqual(tokenInAmount.toString());
      expect(erc20Contract.mock.calls.length).toEqual(1);
    });
  });
});

describe('getUnsignedERC20ApproveTransaction', () => {
  describe("when the owner's address is the same as the spender's address", () => {
    it('should throw an ApprovalError', async () => {
      const amount = BigNumber.from('2000000000000000000');

      expect(() => getUnsignedERC20ApproveTransaction(spenderAddress, WETH_TEST_CHAIN.address, amount, spenderAddress))
        .toThrow(new ApprovalError('owner and spender addresses are the same'));
    });
  });

  describe("when the owner's address is not the same as the spender's address", () => {
    it('should return the correct transaction object', async () => {
      const amount = BigNumber.from('2000000000000000000');

      const erc20ContractInterface = ERC20__factory.createInterface();

      const result = getUnsignedERC20ApproveTransaction(
        TEST_FROM_ADDRESS,
        WETH_TEST_CHAIN.address,
        amount,
        spenderAddress,
      );
      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', result.data);

      expect(decodedResults[0]).toEqual(TEST_PERIPHERY_ROUTER_ADDRESS);
      expect(decodedResults[1].toString()).toEqual(amount.toString());
      expect(result.to).toEqual(WETH_TEST_CHAIN.address);
      expect(result.from).toEqual(TEST_FROM_ADDRESS);
      expect(result.value).toEqual(0); // we do not want to send any ETH
    });
  });
});
