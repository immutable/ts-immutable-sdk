import {
  GasTokenType, ItemType, WrappedBrowserProvider, TransactionOrGasType,
} from '../../types';
import { estimateGas, gasCalculator, getGasItemRequirement } from './gasCalculator';
import { CheckoutErrorType } from '../..';

describe('gasCalculator', () => {
  describe('gasCalculator', () => {
    it('should return gas for transaction', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(100000n),
      } as unknown as WrappedBrowserProvider;

      const item = await gasCalculator(
        mockProvider,
        [],
        {
          type: TransactionOrGasType.TRANSACTION,
          transaction: {
            from: '0xADDRESS',
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.NATIVE,
        amount: BigInt(100000),
        isFee: true,
      });
    });

    it('should return the total gas required for approvals and transaction', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(100000n),
      } as unknown as WrappedBrowserProvider;

      const item = await gasCalculator(
        mockProvider,
        [
          {
            sufficient: false,
            type: ItemType.ERC20,
            delta: BigInt(100000),
            itemRequirement: {
              type: ItemType.ERC20,
              tokenAddress: '0xERC20',
              amount: BigInt(100000),
              spenderAddress: '0xSEAPORT',
              isFee: false,
            },
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0xSEAPORT' },
          },
          {
            sufficient: false,
            type: ItemType.ERC721,
            itemRequirement: {
              type: ItemType.ERC721,
              contractAddress: '0xERC721',
              id: '0',
              spenderAddress: '0xSEAPORT',
            },
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0xSEAPORT' },
          },
        ],
        {
          type: TransactionOrGasType.TRANSACTION,
          transaction: {
            from: '0xADDRESS',
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.NATIVE,
        amount: BigInt(300000),
        isFee: true,
      });
    });

    it('should use gas limit if transactionOrGas is GasAmount', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(100000n),
        getFeeData: jest.fn().mockResolvedValue({
          maxFeePerGas: 1n,
          maxPriorityFeePerGas: 1n,
          gasPrice: null,
        }),
      } as unknown as WrappedBrowserProvider;

      const item = await gasCalculator(
        mockProvider,
        [
          {
            sufficient: false,
            type: ItemType.ERC20,
            delta: BigInt(100000),
            itemRequirement: {
              type: ItemType.ERC20,
              tokenAddress: '0xERC20',
              amount: BigInt(100000),
              spenderAddress: '0xSEAPORT',
              isFee: false,
            },
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0xSEAPORT' },
          },
          {
            sufficient: false,
            type: ItemType.ERC721,
            itemRequirement: {
              type: ItemType.ERC721,
              contractAddress: '0xERC721',
              id: '0',
              spenderAddress: '0xSEAPORT',
            },
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0xSEAPORT' },
          },
        ],
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigInt('100000'),
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.NATIVE,
        amount: BigInt(300000),
        isFee: true,
      });
    });

    it('should use ERC20 for gas if GasAmount in ERC20', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(100000n),
        getFeeData: jest.fn().mockResolvedValue({
          maxFeePerGas: 1n,
          maxPriorityFeePerGas: 1n,
          gasPrice: null,
        }),
      } as unknown as WrappedBrowserProvider;

      const items = await gasCalculator(
        mockProvider,
        [
          {
            sufficient: false,
            type: ItemType.ERC20,
            delta: BigInt(100000),
            itemRequirement: {
              type: ItemType.ERC20,
              tokenAddress: '0xERC20',
              amount: BigInt(100000),
              spenderAddress: '0xSEAPORT',
              isFee: false,
            },
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0xSEAPORT' },
          },
          {
            sufficient: false,
            type: ItemType.ERC721,
            itemRequirement: {
              type: ItemType.ERC721,
              contractAddress: '0xERC721',
              id: '0',
              spenderAddress: '0xSEAPORT',
            },
            approvalTransaction: { from: '0xADDRESS', data: '0xDATA', to: '0xSEAPORT' },
          },
        ],
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.ERC20,
            limit: BigInt('100000'),
            tokenAddress: '0xERC20',
          },
        },
      );

      expect(items).toEqual({
        type: ItemType.ERC20,
        tokenAddress: '0xERC20',
        amount: BigInt(300000),
        spenderAddress: '',
        isFee: true,
      });
    });

    it('should return null if no gas required', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(0n),
      } as unknown as WrappedBrowserProvider;

      const item = await gasCalculator(
        mockProvider,
        [],
        {
          type: TransactionOrGasType.TRANSACTION,
          transaction: {
            from: '0xADDRESS',
          },
        },
      );

      expect(item).toBeNull();
    });
  });

  describe('estimateGas', () => {
    it('should return gas for transaction', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(BigInt(100000)),
      } as unknown as WrappedBrowserProvider;

      const item = await estimateGas(
        mockProvider,
        {
          from: '0xADDRESS',
        },
      );

      expect(item).toEqual(BigInt(100000));
    });

    it('should throw error if estimate gas fails', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockRejectedValue(new Error('Failed to estimate gas')),
      } as unknown as WrappedBrowserProvider;

      let message = '';
      let type = '';

      try {
        await estimateGas(
          mockProvider,
          {
            from: '0xADDRESS',
          },
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
      }

      expect(message).toEqual('Failed to estimate gas for transaction');
      expect(type).toEqual(CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT);
    });
  });

  describe('getGasItemRequirement', () => {
    it('should return native gas item requirement', () => {
      const item = getGasItemRequirement(
        BigInt(100000),
        {
          type: TransactionOrGasType.TRANSACTION,
          transaction: {
            from: '0xADDRESS',
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.NATIVE,
        amount: BigInt(100000),
        isFee: true,
      });
    });

    it('should return native item when gas amount native', () => {
      const item = getGasItemRequirement(
        BigInt(100000),
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigInt(100000),
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.NATIVE,
        amount: BigInt(100000),
        isFee: true,
      });
    });

    it('should return ERC20 item when gas amount erc20', () => {
      const item = getGasItemRequirement(
        BigInt(100000),
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.ERC20,
            limit: BigInt(100000),
            tokenAddress: '0xERC20',
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.ERC20,
        amount: BigInt(100000),
        tokenAddress: '0xERC20',
        spenderAddress: '',
        isFee: true,
      });
    });
  });
});
