import { Contract } from 'ethers';
import {
  getSetERC1155ApprovalForAllTransaction,
  isERC1155ApprovedForAll,
  hasERC1155Allowances,
} from './erc1155';
import { CheckoutErrorType } from '../../errors';
import { ItemRequirement, ItemType, NamedBrowserProvider } from '../../types';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('erc1155', () => {
  const mockProvider = {} as unknown as NamedBrowserProvider;

  describe('isERC1155ApprovedForAll', () => {
    it('should return true if the operator has been approved for all', async () => {
      const isApprovedForAllMock = jest.fn().mockResolvedValue(true);
      (Contract as unknown as jest.Mock).mockReturnValue({
        isApprovedForAll: isApprovedForAllMock,
      });

      const isApproved = await isERC1155ApprovedForAll(
        mockProvider,
        '0xCaller',
        '0xERC721',
        '0xOperator',
      );
      expect(isApproved).toEqual(true);
      expect(isApprovedForAllMock).toBeCalledWith('0xCaller', '0xOperator');
    });

    it('should return false if the operator has not been approved for all', async () => {
      const isApprovedForAllMock = jest.fn().mockResolvedValue(false);
      (Contract as unknown as jest.Mock).mockReturnValue({
        isApprovedForAll: isApprovedForAllMock,
      });

      const isApproved = await isERC1155ApprovedForAll(
        mockProvider,
        '0xCaller',
        '0xERC721',
        '0xOperator',
      );
      expect(isApproved).toEqual(false);
      expect(isApprovedForAllMock).toBeCalledWith('0xCaller', '0xOperator');
    });
  });

  describe('getSetERC1155ApprovalForAllTransaction', () => {
    it('should get the approval transaction from the contract with the from added', async () => {
      const setERC1155ApprovalForAllTransactionMock = jest.fn().mockResolvedValue({ data: '0xDATA' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        setApprovalForAll: {
          populateTransaction: setERC1155ApprovalForAllTransactionMock,
        },
      });

      const approvalTransaction = await getSetERC1155ApprovalForAllTransaction(
        mockProvider,
        '0xADDRESS',
        '0xERC721',
        '0xSEAPORT',
      );
      expect(approvalTransaction).toEqual({ from: '0xADDRESS', data: '0xDATA' });
      expect(setERC1155ApprovalForAllTransactionMock).toBeCalledWith('0xSEAPORT', true);
    });

    it('should throw checkout error if call to approve fails', async () => {
      const setERC1155ApprovalForAllTransactionMock = jest.fn().mockRejectedValue({ from: '0xADDRESS' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        setApprovalForAll: {
          populateTransaction: setERC1155ApprovalForAllTransactionMock,
        },
      });

      let message;
      let type;
      let data;

      try {
        await getSetERC1155ApprovalForAllTransaction(
          mockProvider,
          '0xADDRESS',
          '0xERC1155',
          '0xSEAPORT',
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(message).toEqual('Failed to get the approval transaction for ERC1155');
      expect(type).toEqual(CheckoutErrorType.GET_ERC1155_ALLOWANCE_ERROR);
      expect(data).toEqual({
        error: {
          from: '0xADDRESS',
        },
        contractAddress: '0xERC1155',
        spenderAddress: '0xSEAPORT',
        ownerAddress: '0xADDRESS',
      });
      expect(setERC1155ApprovalForAllTransactionMock).toBeCalledWith('0xSEAPORT', true);
    });
  });

  describe('hasERC1155Allowances', () => {
    it(
      'should return allowances with sufficient false and approval transaction if allowance not sufficient',
      async () => {
        const isApprovedForAllMock = jest.fn().mockResolvedValue(false);
        const approveTxMock = jest.fn().mockResolvedValue({ data: '0xDATA', to: '0x00000' });
        (Contract as unknown as jest.Mock).mockReturnValue({
          isApprovedForAll: isApprovedForAllMock,
          setApprovalForAll: {
            populateTransaction: approveTxMock,
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
            type: ItemType.ERC1155,
            amount: BigInt(5),
            contractAddress: '0xERC1155',
            id: '0',
            spenderAddress: '0xSEAPORT',
          },
        ];

        const allowances = await hasERC1155Allowances(mockProvider, '0xADDRESS', itemRequirements);
        expect(allowances.sufficient).toBeFalsy();
        expect(allowances.allowances).toEqual([
          {
            type: ItemType.ERC1155,
            sufficient: false,
            itemRequirement: itemRequirements[2],
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0x00000' },
          },
        ]);
      },
    );

    it('should return allowances with sufficient true if allowance sufficient', async () => {
      const isApprovedForAllMock = jest.fn().mockResolvedValue(true);
      (Contract as unknown as jest.Mock).mockReturnValue({
        isApprovedForAll: isApprovedForAllMock,
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
          type: ItemType.ERC1155,
          amount: BigInt(5),
          contractAddress: '0xERC1155',
          id: '0',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const allowances = await hasERC1155Allowances(mockProvider, '0xADDRESS', itemRequirements);
      expect(allowances.sufficient).toBeTruthy();
      expect(allowances.allowances).toEqual([
        {
          sufficient: true,
          itemRequirement: itemRequirements[2],
        },
      ]);
    });

    it('should handle multiple ERC1155 item requirements', async () => {
      const isApprovedForAllMock = jest.fn().mockResolvedValue(true);
      const setERC1155ApprovalForAllTransactionMock = jest.fn().mockRejectedValue({ data: '0xDATA' });
      (Contract as unknown as jest.Mock).mockReturnValue({
        isApprovedForAll: isApprovedForAllMock,
        populateTransaction: {
          setApprovalForAll: setERC1155ApprovalForAllTransactionMock,
        },
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.ERC1155,
          contractAddress: '0xERC1155',
          amount: BigInt(5),
          id: '0',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC1155,
          contractAddress: '0xERC1155',
          amount: BigInt(5),
          id: '1',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC1155,
          contractAddress: '0xERC1155',
          amount: BigInt(5),
          id: '2',
          spenderAddress: '0x00000000',
        },
      ];

      const allowances = await hasERC1155Allowances(mockProvider, '0xADDRESS', itemRequirements);
      expect(allowances.sufficient).toBeTruthy();
      expect(allowances.allowances).toEqual(expect.arrayContaining([
        {
          sufficient: true,
          itemRequirement: itemRequirements[1],
        },
        {
          sufficient: true,
          itemRequirement: itemRequirements[2],
        },
        {
          sufficient: true,
          itemRequirement: itemRequirements[2],
        },
      ]));
    });
  });
});
