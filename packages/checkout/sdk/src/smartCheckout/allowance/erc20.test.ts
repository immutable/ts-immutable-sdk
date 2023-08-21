import { BigNumber, Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { getERC20Allowance, getERC20ApprovalTransaction, hasERC20Allowances } from './erc20';
import { CheckoutErrorType } from '../../errors';
import { ItemRequirement, ItemType } from '../../types';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('allowance', () => {
  const mockProvider = {} as unknown as Web3Provider;

  describe('getERC20Allowance', () => {
    it('should get the allowance from the contract', async () => {
      const allowanceMock = jest.fn().mockResolvedValue(BigNumber.from(1));
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
      });

      const allowance = await getERC20Allowance(
        mockProvider,
        '0xADDRESS',
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

      let message = '';
      let type = '';
      let data = {};

      try {
        await getERC20Allowance(
          mockProvider,
          '0xADDRESS',
          'OxERC20',
          '0xSEAPORT',
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Failed to get the allowance for ERC20');
      expect(type).toEqual(CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR);
      expect(data).toEqual({
        contractAddress: 'OxERC20',
      });
      expect(allowanceMock).toBeCalledWith('0xADDRESS', '0xSEAPORT');
    });
  });

  describe('getERC20ApprovalTransaction', () => {
    it('should get the approval transaction from the contract with the from added', async () => {
      const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: approveMock,
        },
      });

      const approvalTransaction = await getERC20ApprovalTransaction(
        mockProvider,
        '0xADDRESS',
        'OxERC20',
        '0xSEAPORT',
        BigNumber.from(1),
      );
      expect(approvalTransaction).toEqual({ from: '0xADDRESS', data: '0xDATA' });
      expect(approveMock).toBeCalledWith('0xSEAPORT', BigNumber.from(1));
    });

    it('should error is call to approve fails', async () => {
      const approveMock = jest.fn().mockRejectedValue({ from: '0xADDRESS' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: approveMock,
        },
      });

      let message = '';
      let type = '';
      let data = {};

      try {
        await getERC20ApprovalTransaction(
          mockProvider,
          '0xADDRESS',
          'OxERC20',
          '0xSEAPORT',
          BigNumber.from(1),
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Failed to get the approval transaction for ERC20');
      expect(type).toEqual(CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR);
      expect(data).toEqual({
        contractAddress: 'OxERC20',
      });
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

      const allowances = await hasERC20Allowances(mockProvider, '0xADDRESS', itemRequirements);
      expect(allowances.sufficient).toBeFalsy();
      expect(allowances.allowances).toEqual([
        {
          type: ItemType.ERC20,
          sufficient: false,
          delta: BigNumber.from(1),
          itemRequirement: itemRequirements[1],
          approvalTransaction: { from: '0xADDRESS' },
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

      const allowances = await hasERC20Allowances(mockProvider, '0xADDRESS', itemRequirements);
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
        {
          type: ItemType.ERC20,
          contractAddress: '0xERC20c',
          amount: BigNumber.from(2),
          spenderAddress: '0xSEAPORT',
        },
      ];

      const allowances = await hasERC20Allowances(mockProvider, '0xADDRESS', itemRequirements);
      expect(allowances.sufficient).toBeFalsy();
      expect(allowances.allowances).toEqual(expect.arrayContaining([
        {
          sufficient: true,
          itemRequirement: itemRequirements[2],
        },
        {
          type: ItemType.ERC20,
          sufficient: false,
          delta: BigNumber.from(1),
          itemRequirement: itemRequirements[1],
          approvalTransaction: { from: '0xADDRESS' },
        },
        {
          type: ItemType.ERC20,
          sufficient: false,
          delta: BigNumber.from(1),
          itemRequirement: itemRequirements[3],
          approvalTransaction: { from: '0xADDRESS' },
        },
      ]));
    });
  });
});
