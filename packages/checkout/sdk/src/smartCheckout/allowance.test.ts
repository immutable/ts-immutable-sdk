import { BigNumber, Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { getERC20Allowance, getERC20ApprovalTransaction, hasERC20Allowances } from './allowance';
import { CheckoutErrorType } from '../errors';
import { ItemRequirement, ItemType } from '../types';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('allowance', () => {
  let mockProvider: Web3Provider;

  describe('getERC20Allowance', () => {
    it('should get the allowance from the contract', async () => {
      const allowanceMock = jest.fn().mockResolvedValue(BigNumber.from(1));
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      const allowance = await getERC20Allowance(
        mockProvider,
        'OxERC20',
        '0xSEAPORT',
      );
      expect(allowance).toEqual(BigNumber.from(1));
      expect(allowanceMock).toBeCalledWith('0xADDRESS', '0xSEAPORT');
    });

    it('should throw checkout error when allowance call errors', async () => {
      const allowanceMock = jest.fn().mockRejectedValue({});
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      try {
        await getERC20Allowance(
          mockProvider,
          'OxERC20',
          '0xSEAPORT',
        );
      } catch (err: any) {
        expect(err.message).toEqual('Failed to get the allowance for ERC20');
        expect(err.type).toEqual(CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR);
        expect(err.data).toEqual({
          contractAddress: 'OxERC20',
        });
        expect(allowanceMock).toBeCalledWith('0xADDRESS', '0xSEAPORT');
      }
    });

    it('should throw checkout error when provider call errors', async () => {
      const allowanceMock = jest.fn().mockResolvedValue({});
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
      });

      try {
        mockProvider = {
          getSigner: jest.fn().mockReturnValue({
            getAddress: jest.fn().mockRejectedValue(''),
          }),
        } as unknown as Web3Provider;

        await getERC20Allowance(
          mockProvider,
          'OxERC20',
          '0xSEAPORT',
        );
      } catch (err: any) {
        expect(err.message).toEqual('Failed to get the allowance for ERC20');
        expect(err.type).toEqual(CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR);
        expect(err.data).toEqual({
          contractAddress: 'OxERC20',
        });
        expect(allowanceMock).toBeCalledTimes(0);
      }
    });
  });

  describe('getERC20ApprovalTransaction', () => {
    it('should get the approval transaction from the contract', async () => {
      const approveMock = jest.fn().mockResolvedValue({ from: '0xADDRESS' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: approveMock,
        },
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      const approvalTransaction = await getERC20ApprovalTransaction(
        mockProvider,
        'OxERC20',
        '0xSEAPORT',
        BigNumber.from(1),
      );
      expect(approvalTransaction).toEqual({ from: '0xADDRESS' });
      expect(approveMock).toBeCalledWith('0xSEAPORT', BigNumber.from(1));
    });

    it('should return undefined if approve call errors', async () => {
      const approveMock = jest.fn().mockRejectedValue({ from: '0xADDRESS' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: approveMock,
        },
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      const approvalTransaction = await getERC20ApprovalTransaction(
        mockProvider,
        'OxERC20',
        '0xSEAPORT',
        BigNumber.from(1),
      );
      expect(approvalTransaction).toBeUndefined();
      expect(approveMock).toBeCalledWith('0xSEAPORT', BigNumber.from(1));
    });
  });

  describe('hasERC20Allowances', () => {
    it('should return allowances with sufficient false if allowance not sufficient', async () => {
      const approveMock = jest.fn().mockResolvedValue({ from: '0xADDRESS' });
      const allowanceMock = jest.fn().mockResolvedValue(BigNumber.from(1));
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
        populateTransaction: {
          approve: approveMock,
        },
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          contractAddress: '0xERC20',
          amount: BigNumber.from(2),
          spenderAddress: '0xSEAPORT',
        },
      ];

      const allowances = await hasERC20Allowances(mockProvider, itemRequirements);
      expect(allowances.sufficient).toBeFalsy();
      expect(allowances.allowances).toEqual([
        {
          sufficient: false,
          delta: BigNumber.from(1),
          itemRequirement: itemRequirements[1],
          transaction: { from: '0xADDRESS' },
        },
      ]);
    });

    it('should return sufficient true if all allowances are sufficient', async () => {
      const approveMock = jest.fn().mockResolvedValue({});
      const allowanceMock = jest.fn().mockResolvedValue(BigNumber.from(1));
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
        populateTransaction: {
          approve: approveMock,
        },
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          contractAddress: '0xERC20',
          amount: BigNumber.from(1),
          spenderAddress: '0xSEAPORT',
        },
      ];

      const allowances = await hasERC20Allowances(mockProvider, itemRequirements);
      expect(allowances.sufficient).toBeTruthy();
      expect(allowances.allowances).toEqual([
        {
          sufficient: true,
          itemRequirement: itemRequirements[1],
        },
      ]);
    });

    it('should handle multiple ERC20 requirements', async () => {
      const approveMock = jest.fn().mockResolvedValue({ from: '0xADDRESS' });
      const allowanceMock = jest.fn().mockResolvedValue(BigNumber.from(1));
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
        populateTransaction: {
          approve: approveMock,
        },
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          contractAddress: '0xERC20a',
          amount: BigNumber.from(2),
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          contractAddress: '0xERC20b',
          amount: BigNumber.from(1),
          spenderAddress: '0xSEAPORT',
        },
      ];

      const allowances = await hasERC20Allowances(mockProvider, itemRequirements);
      expect(allowances.sufficient).toBeFalsy();
      expect(allowances.allowances).toEqual([
        {
          sufficient: false,
          delta: BigNumber.from(1),
          itemRequirement: itemRequirements[1],
          transaction: { from: '0xADDRESS' },
        },
        {
          sufficient: true,
          itemRequirement: itemRequirements[2],
        },
      ]);
    });
  });
});
