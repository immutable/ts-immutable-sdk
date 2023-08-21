import { BigNumber, Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import {
  convertIdToNumber,
  getApproveTransaction,
  getERC721ApprovedAddress,
  hasERC721Allowances,
} from './erc721';
import { CheckoutErrorType } from '../../errors';
import { ItemRequirement, ItemType } from '../../types';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('erc721', () => {
  const mockProvider = {} as unknown as Web3Provider;

  describe('getERC20Allowance', () => {
    it('should get the allowance from the contract', async () => {
      const getApprovedMock = jest.fn().mockResolvedValue('0xSEAPORT');
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
      });

      const address = await getERC721ApprovedAddress(
        mockProvider,
        '0xERC721',
        0,
      );
      expect(address).toEqual('0xSEAPORT');
      expect(getApprovedMock).toBeCalledWith(0);
    });

    it('should throw checkout error when getApproved call errors', async () => {
      const getApprovedMock = jest.fn().mockRejectedValue({});
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
      });

      let message = '';
      let type = '';
      let data = {};

      try {
        await getERC721ApprovedAddress(
          mockProvider,
          '0xERC721',
          0,
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Failed to get approved address for ERC721');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        contractAddress: '0xERC721',
      });
      expect(getApprovedMock).toBeCalledWith(0);
    });
  });

  describe('getApproveTransaction', () => {
    it('should get the approval transaction from the contract with the from added', async () => {
      const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: approveMock,
        },
      });

      const approvalTransaction = await getApproveTransaction(
        mockProvider,
        '0xADDRESS',
        '0xERC721',
        '0xSEAPORT',
        0,
      );
      expect(approvalTransaction).toEqual({ from: '0xADDRESS', data: '0xDATA' });
      expect(approveMock).toBeCalledWith('0xSEAPORT', 0);
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
        await getApproveTransaction(
          mockProvider,
          '0xADDRESS',
          '0xERC721',
          '0xSEAPORT',
          0,
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Failed to get the approval transaction for ERC721');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        contractAddress: '0xERC721',
      });
      expect(approveMock).toBeCalledWith('0xSEAPORT', 0);
    });
  });

  describe('hasERC721Allowances', () => {
    it(
      'should return allowances with sufficient false and approval transaction if allowance not sufficient',
      async () => {
        const getApprovedMock = jest.fn().mockResolvedValue('0x00000000');
        const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA', to: '0x00000' });
        (Contract as unknown as jest.Mock).mockReturnValue({
          getApproved: getApprovedMock,
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
            type: ItemType.ERC721,
            contractAddress: '0xERC721',
            id: '0',
            spenderAddress: '0xSEAPORT',
          },
        ];

        const allowances = await hasERC721Allowances(mockProvider, '0xADDRESS', itemRequirements);
        expect(allowances.sufficient).toBeFalsy();
        expect(allowances.allowances).toEqual([
          {
            type: ItemType.ERC721,
            sufficient: false,
            itemRequirement: itemRequirements[1],
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0x00000' },
          },
        ]);
      },
    );

    it('should return allowances with sufficient true if allowance sufficient', async () => {
      const getApprovedMock = jest.fn().mockResolvedValue('0xSEAPORT');
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: '0',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const allowances = await hasERC721Allowances(mockProvider, '0xADDRESS', itemRequirements);
      expect(allowances.sufficient).toBeTruthy();
      expect(allowances.allowances).toEqual([
        {
          sufficient: true,
          itemRequirement: itemRequirements[1],
        },
      ]);
    });

    it('should handle multiple ERC721 item requirements', async () => {
      const getApprovedMock = jest.fn().mockResolvedValue('0x00000000');
      const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA', to: '0x00000' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
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
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: '0',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: '1',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: '2',
          spenderAddress: '0x00000000',
        },
      ];

      const allowances = await hasERC721Allowances(mockProvider, '0xADDRESS', itemRequirements);
      expect(allowances.sufficient).toBeFalsy();
      expect(allowances.allowances).toEqual(expect.arrayContaining([
        {
          type: ItemType.ERC721,
          sufficient: false,
          itemRequirement: itemRequirements[1],
          approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0x00000' },
        },
        {
          type: ItemType.ERC721,
          sufficient: false,
          itemRequirement: itemRequirements[2],
          approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0x00000' },
        },
        {
          sufficient: true,
          itemRequirement: itemRequirements[3],
        },
      ]));
    });

    it('should error if an item requirement has an invalid id', async () => {
      const getApprovedMock = jest.fn().mockResolvedValue('0x00000000');
      const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA', to: '0x00000' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
        populateTransaction: {
          approve: approveMock,
        },
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: '1',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: 'invalid',
          spenderAddress: '0xSEAPORT',
        },
      ];

      let message = '';
      let type = '';
      let data = {};

      try {
        await hasERC721Allowances(mockProvider, '0xADDRESS', itemRequirements);
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Invalid ERC721 ID');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        id: 'invalid',
        contractAddress: '0xERC721',
      });
    });
  });

  describe('convertIdToNumber', () => {
    it('should converts a valid string ID to a number', () => {
      const id = '123';
      const result = convertIdToNumber(id, '0xERC721');
      expect(result).toBe(123);
    });

    it('should throws an error for invalid string ID', () => {
      const id = 'invalid';

      let message = '';
      let type = '';
      let data = {};

      try {
        convertIdToNumber(id, '0xERC721');
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Invalid ERC721 ID');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        id: 'invalid',
        contractAddress: '0xERC721',
      });
    });

    it('should throws an error for empty string ID', () => {
      const id = '';

      let message = '';
      let type = '';
      let data = {};

      try {
        convertIdToNumber(id, '0xERC721');
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Invalid ERC721 ID');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        id: '',
        contractAddress: '0xERC721',
      });
    });

    it('should throws an error for whitespace string ID', () => {
      const id = ' ';

      let message = '';
      let type = '';
      let data = {};

      try {
        convertIdToNumber(id, '0xERC721');
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Invalid ERC721 ID');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        id: ' ',
        contractAddress: '0xERC721',
      });
    });

    it('should throws an error for null ID', () => {
      const id = null as any;

      let message = '';
      let type = '';
      let data = {};

      try {
        convertIdToNumber(id, '0xERC721');
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Invalid ERC721 ID');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        id: null,
        contractAddress: '0xERC721',
      });
    });

    it('should throws an error for undefined ID', () => {
      const id = undefined as any;

      let message = '';
      let type = '';
      let data = {};

      try {
        convertIdToNumber(id, '0xERC721');
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Invalid ERC721 ID');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        id: undefined,
        contractAddress: '0xERC721',
      });
    });
  });
});
