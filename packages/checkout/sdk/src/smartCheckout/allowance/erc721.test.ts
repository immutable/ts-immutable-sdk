import { BigNumber, Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import {
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
        'OxERC721',
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

      try {
        await getERC721ApprovedAddress(
          mockProvider,
          'OxERC721',
          0,
        );
      } catch (err: any) {
        expect(getApprovedMock).toBeCalledWith(0);
        expect(err.message).toEqual('Failed to get approved address for ERC721');
        expect(err.type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
        expect(err.data).toEqual({
          contractAddress: 'OxERC721',
        });
      }
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

      try {
        await getApproveTransaction(
          mockProvider,
          '0xADDRESS',
          '0xERC721',
          '0xSEAPORT',
          0,
        );
      } catch (err: any) {
        expect(err.message).toEqual('Failed to get the approval transaction for ERC721');
        expect(err.type).toEqual(CheckoutErrorType.GET_ERC721_ALLOWANCE_ERROR);
        expect(err.data).toEqual({
          contractAddress: '0xERC721',
        });
        expect(approveMock).toBeCalledWith('0xSEAPORT', 0);
      }
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
  });
});
