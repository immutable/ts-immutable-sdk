import { BrowserProvider, Contract } from 'ethers';
import {
  convertIdToNumber,
  getApproveTransaction,
  getERC721ApprovedAddress,
  getERC721ApprovedForAll,
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
  const mockProvider = {} as unknown as BrowserProvider;

  describe('getERC721ApprovedAddress', () => {
    it('should get the allowance from the contract', async () => {
      const getApprovedMock = jest.fn().mockResolvedValue('0xSEAPORT');
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
      });

      const address = await getERC721ApprovedAddress(
        mockProvider,
        '0xERC721',
        BigInt(0),
      );
      expect(address).toEqual('0xSEAPORT');
      expect(getApprovedMock).toBeCalledWith(BigInt(0));
    });

    it('should throw checkout error when getApproved call errors', async () => {
      const getApprovedMock = jest.fn().mockRejectedValue({});
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
      });

      let message;
      let type;
      let data;

      try {
        await getERC721ApprovedAddress(
          mockProvider,
          '0xERC721',
          BigInt(0),
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Failed to get approved address for ERC721');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        id: '0',
        error: {},
        contractAddress: '0xERC721',
      });
      expect(getApprovedMock).toBeCalledWith(BigInt(0));
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
        BigInt(0),
      );
      expect(approvalTransaction).toEqual({ from: '0xADDRESS', data: '0xDATA' });
      expect(approveMock).toBeCalledWith('0xSEAPORT', BigInt(0));
    });

    it('should throw checkout error if call to approve fails', async () => {
      const approveMock = jest.fn().mockRejectedValue({ from: '0xADDRESS' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: approveMock,
        },
      });

      let message;
      let type;
      let data;

      try {
        await getApproveTransaction(
          mockProvider,
          '0xADDRESS',
          '0xERC721',
          '0xSEAPORT',
          BigInt(0),
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Failed to get the approval transaction for ERC721');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data).toEqual({
        id: '0',
        error: {
          from: '0xADDRESS',
        },
        contractAddress: '0xERC721',
        spenderAddress: '0xSEAPORT',
        ownerAddress: '0xADDRESS',
      });
      expect(approveMock).toBeCalledWith('0xSEAPORT', BigInt(0));
    });
  });

  describe('getERC721ApprovedForAll', () => {
    it('should get the approved for all from the contract', async () => {
      const isApprovedForAllMock = jest.fn().mockResolvedValue(true);
      (Contract as unknown as jest.Mock).mockReturnValue({
        isApprovedForAll: isApprovedForAllMock,
      });

      const approvedForAll = await getERC721ApprovedForAll(
        mockProvider,
        '0xADDRESS',
        '0xERC721',
        '0xSEAPORT',
      );
      expect(approvedForAll).toBeTruthy();
      expect(isApprovedForAllMock).toBeCalledWith('0xADDRESS', '0xSEAPORT');
    });

    it('should throw checkout error if call to isApprovedForAll fails', async () => {
      const isApprovedForAllMock = jest.fn().mockRejectedValue({});
      (Contract as unknown as jest.Mock).mockReturnValue({
        isApprovedForAll: isApprovedForAllMock,
      });

      let message;
      let type;
      let data;
      try {
        await getERC721ApprovedForAll(
          mockProvider,
          '0xADDRESS',
          '0xERC721',
          '0xSEAPORT',
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Failed to check approval for all ERC721s of collection');
      expect(type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
      expect(data.error).toBeDefined();
      expect(data.ownerAddress).toEqual('0xADDRESS');
      expect(data.contractAddress).toEqual('0xERC721');
      expect(data.spenderAddress).toEqual('0xSEAPORT');
      expect(isApprovedForAllMock).toBeCalledWith('0xADDRESS', '0xSEAPORT');
    });
  });

  describe('hasERC721Allowances', () => {
    it(
      'should return allowances with sufficient false and approval transaction if allowance not sufficient',
      async () => {
        const isApprovedForAllMock = jest.fn().mockResolvedValue(false);
        const getApprovedMock = jest.fn().mockResolvedValue('0x00000000');
        const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA', to: '0x00000' });
        (Contract as unknown as jest.Mock).mockReturnValue({
          getApproved: getApprovedMock,
          isApprovedForAll: isApprovedForAllMock,
          populateTransaction: {
            approve: approveMock,
          },
        });

        const itemRequirements: ItemRequirement[] = [
          {
            type: ItemType.NATIVE,
            amount: BigInt(1),
            isFee: false,
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
      const isApprovedForAllMock = jest.fn().mockResolvedValue(false);
      const getApprovedMock = jest.fn().mockResolvedValue('0xSEAPORT');
      (Contract as unknown as jest.Mock).mockReturnValue({
        isApprovedForAll: isApprovedForAllMock,
        getApproved: getApprovedMock,
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
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
      const isApprovedForAllMock = jest.fn().mockResolvedValue(false);
      const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA', to: '0x00000' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
        isApprovedForAll: isApprovedForAllMock,
        populateTransaction: {
          approve: approveMock,
        },
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
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
      const isApprovedForAllMock = jest.fn().mockResolvedValue(false);
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
        isApprovedForAll: isApprovedForAllMock,
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

    it('should return sufficient true if approved for all', async () => {
      const isApprovedForAllMock = jest.fn().mockResolvedValue(true);
      const getApprovedMock = jest.fn().mockResolvedValue('0x00000000');
      const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA', to: '0x00000' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        getApproved: getApprovedMock,
        isApprovedForAll: isApprovedForAllMock,
        populateTransaction: {
          approve: approveMock,
        },
      });

      const itemRequirements: ItemRequirement[] = [
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
          spenderAddress: '0xSEAPORT',
        },
      ];

      const allowances = await hasERC721Allowances(mockProvider, '0xADDRESS', itemRequirements);
      expect(allowances.sufficient).toBeTruthy();
      expect(allowances.allowances).toEqual([
        {
          sufficient: true,
          itemRequirement: itemRequirements[0],
        },
        {
          sufficient: true,
          itemRequirement: itemRequirements[1],
        },
        {
          sufficient: true,
          itemRequirement: itemRequirements[2],
        },
      ]);

      expect(isApprovedForAllMock).toBeCalledWith('0xADDRESS', '0xSEAPORT');
      expect(getApprovedMock).toBeCalledTimes(0);
      expect(approveMock).toBeCalledTimes(0);
    });

    it(
      'should return sufficient false for non-approved items and true for contract addresses that are approved for all',
      async () => {
        const isApprovedForAllMock = jest.fn()
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
        const getApprovedMock = jest.fn().mockResolvedValue('0xSEAPORT');
        const approveMock = jest.fn().mockResolvedValue({ data: '0xDATA', to: '0xOTHER' });
        (Contract as unknown as jest.Mock).mockReturnValue({
          getApproved: getApprovedMock,
          isApprovedForAll: isApprovedForAllMock,
          populateTransaction: {
            approve: approveMock,
          },
        });

        const itemRequirements: ItemRequirement[] = [
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
            spenderAddress: '0xOTHER',
          },
        ];

        const allowances = await hasERC721Allowances(mockProvider, '0xADDRESS', itemRequirements);
        expect(allowances.sufficient).toBeFalsy();
        expect(allowances.allowances).toEqual([
          {
            sufficient: true,
            itemRequirement: itemRequirements[0],
          },
          {
            sufficient: true,
            itemRequirement: itemRequirements[1],
          },
          {
            type: ItemType.ERC721,
            sufficient: false,
            itemRequirement: itemRequirements[2],
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0xOTHER' },
          },
        ]);

        expect(isApprovedForAllMock).toBeCalledTimes(2);
        expect(getApprovedMock).toBeCalledTimes(1);
        expect(approveMock).toBeCalledTimes(1);
      },
    );
  });

  describe('convertIdToNumber', () => {
    it('should converts a valid string ID to a number', () => {
      const id = '123';
      const result = convertIdToNumber(id, '0xERC721');
      expect(result.toString()).toBe('123');
    });

    it('should throw checkout error an error for invalid string ID', () => {
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

    it('should throw checkout error an error for empty string ID', () => {
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

    it('should throw checkout error an error for whitespace string ID', () => {
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

    it('should throw checkout error an error for null ID', () => {
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

    it('should throw checkout error an error for undefined ID', () => {
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
