import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getBridgeGasEstimate } from './bridgeGasEstimate';
import { ChainId } from '../types';

describe('getBridgeGasEstimate', () => {
  it('should return gasEstimate for provided txn', async () => {
    const txn = {
      maxFeePerGas: '0x1',
      maxPriorityFeePerGas: '0x1',
      gasPrice: '0x1',
      gasLimit: '0x1',
      to: '0x1',
      value: '0x1',
      data: '0x1',
    };
    const provider = {
      estimateGas: jest.fn().mockResolvedValue(1),
    } as unknown as Web3Provider;

    const result = await getBridgeGasEstimate(txn, provider, ChainId.ETHEREUM);

    expect(result).toEqual(BigNumber.from('0x02'));
  });

  it('should return gas estimate for txn and approve txn', async () => {
    const txn = {
      maxFeePerGas: '0x1',
      maxPriorityFeePerGas: '0x1',
      gasPrice: '0x1',
      gasLimit: '0x1',
      to: '0x1',
      value: '0x1',
      data: '0x1',
    };
    const approveTxn = {
      maxFeePerGas: '0x1',
      maxPriorityFeePerGas: '0x1',
      gasPrice: '0x1',
      gasLimit: '0x1',
      to: '0x1',
      value: '0x1',
      data: '0x1',
    };
    const provider = {
      estimateGas: jest.fn().mockResolvedValue(1),
    } as unknown as Web3Provider;

    const result = await getBridgeGasEstimate(
      txn,
      provider,
      ChainId.ETHEREUM,
      approveTxn,
    );

    expect(result).toEqual(BigNumber.from('0x04'));
  });
});
