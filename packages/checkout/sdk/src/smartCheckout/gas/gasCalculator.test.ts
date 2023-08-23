import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  GasTokenType, ItemType, TransactionOrGasType,
} from '../../types';
import { gasCalculator } from './gasCalculator';

describe('gasCalculator', () => {
  it('should return the total gas required for the transactions', async () => {
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
            contractAddress: '0xERC20',
            amount: BigNumber.from(100000),
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
      amount: BigNumber.from(200000),
    });
  });

  it('should use gas limit if transactionOrGas is GasAmount', async () => {
    const mockProvider = {
      estimateGas: jest.fn().mockResolvedValue(100000),
      getFeeData: jest.fn().mockResolvedValue({
        maxFeePerGas: '0x1',
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
            contractAddress: '0xERC20',
            amount: BigNumber.from(100000),
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
      amount: BigNumber.from(300000),
    });
  });

  it('should use ERC20 for gas if GasAmount in ERC20', async () => {
    const mockProvider = {
      estimateGas: jest.fn().mockResolvedValue(100000),
      getFeeData: jest.fn().mockResolvedValue({
        maxFeePerGas: '0x1',
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
            contractAddress: '0xERC20',
            amount: BigNumber.from(100000),
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
          contractAddress: '0xERC20',
        },
      },
    );

    expect(items).toEqual({
      type: ItemType.ERC20,
      contractAddress: '0xERC20',
      amount: BigNumber.from(300000),
      spenderAddress: '',
    });
  });
});
