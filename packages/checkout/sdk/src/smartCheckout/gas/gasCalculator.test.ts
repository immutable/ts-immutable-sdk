import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  GasTokenType, ItemType, TransactionOrGasType,
} from '../../types';
import { estimateGas, gasCalculator, getGasItemRequirement } from './gasCalculator';
import { CheckoutErrorType } from '../..';

describe('gasCalculator', () => {
  describe('gasCalculator', () => {
    it('should return gas for transaction', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(100000),
      } as unknown as Web3Provider;

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
        amount: BigNumber.from(100000),
      });
    });

    it('should return the total gas required for approvals and transaction', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(100000),
      } as unknown as Web3Provider;

      const item = await gasCalculator(
        mockProvider,
        [
          {
            sufficient: false,
            type: ItemType.ERC20,
            delta: BigNumber.from(100000),
            itemRequirement: {
              type: ItemType.ERC20,
              tokenAddress: '0xERC20',
              amount: BigNumber.from(100000),
              spenderAddress: '0xSEAPORT',
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
        amount: BigNumber.from(300000),
      });
    });

    it('should use gas limit if transactionOrGas is GasAmount', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(100000),
        getFeeData: jest.fn().mockResolvedValue({
          lastBaseFeePerGas: '0x1',
          maxPriorityFeePerGas: '0x1',
          gasPrice: null,
        }),
      } as unknown as Web3Provider;

      const item = await gasCalculator(
        mockProvider,
        [
          {
            sufficient: false,
            type: ItemType.ERC20,
            delta: BigNumber.from(100000),
            itemRequirement: {
              type: ItemType.ERC20,
              tokenAddress: '0xERC20',
              amount: BigNumber.from(100000),
              spenderAddress: '0xSEAPORT',
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
            limit: BigNumber.from('100000'),
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.NATIVE,
        amount: BigNumber.from(400000),
      });
    });

    it('should use ERC20 for gas if GasAmount in ERC20', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(100000),
        getFeeData: jest.fn().mockResolvedValue({
          lastBaseFeePerGas: '0x1',
          maxPriorityFeePerGas: '0x1',
          gasPrice: null,
        }),
      } as unknown as Web3Provider;

      const items = await gasCalculator(
        mockProvider,
        [
          {
            sufficient: false,
            type: ItemType.ERC20,
            delta: BigNumber.from(100000),
            itemRequirement: {
              type: ItemType.ERC20,
              tokenAddress: '0xERC20',
              amount: BigNumber.from(100000),
              spenderAddress: '0xSEAPORT',
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
            limit: BigNumber.from('100000'),
            tokenAddress: '0xERC20',
          },
        },
      );

      expect(items).toEqual({
        type: ItemType.ERC20,
        tokenAddress: '0xERC20',
        amount: BigNumber.from(400000),
        spenderAddress: '',
      });
    });

    it('should return null if no gas required', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockResolvedValue(0),
      } as unknown as Web3Provider;

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
        estimateGas: jest.fn().mockResolvedValue(BigNumber.from(100000)),
      } as unknown as Web3Provider;

      const item = await estimateGas(
        mockProvider,
        {
          from: '0xADDRESS',
        },
      );

      expect(item).toEqual(BigNumber.from(100000));
    });

    it('should throw error if estimate gas fails', async () => {
      const mockProvider = {
        estimateGas: jest.fn().mockRejectedValue(new Error('Failed to estimate gas')),
      } as unknown as Web3Provider;

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
        BigNumber.from(100000),
        {
          type: TransactionOrGasType.TRANSACTION,
          transaction: {
            from: '0xADDRESS',
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.NATIVE,
        amount: BigNumber.from(100000),
      });
    });

    it('should return native item when gas amount native', () => {
      const item = getGasItemRequirement(
        BigNumber.from(100000),
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.NATIVE,
            limit: BigNumber.from(100000),
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.NATIVE,
        amount: BigNumber.from(100000),
      });
    });

    it('should return ERC20 item when gas amount erc20', () => {
      const item = getGasItemRequirement(
        BigNumber.from(100000),
        {
          type: TransactionOrGasType.GAS,
          gasToken: {
            type: GasTokenType.ERC20,
            limit: BigNumber.from(100000),
            tokenAddress: '0xERC20',
          },
        },
      );

      expect(item).toEqual({
        type: ItemType.ERC20,
        amount: BigNumber.from(100000),
        tokenAddress: '0xERC20',
        spenderAddress: '',
      });
    });
  });
});
