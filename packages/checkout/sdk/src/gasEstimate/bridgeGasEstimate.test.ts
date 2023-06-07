import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getBridgeEstimatedGas } from './bridgeGasEstimate';
import { ChainId } from '../types';

describe('getBridgeGasEstimate', () => {
  let provider: Web3Provider;

  beforeEach(() => {
    provider = {
      estimateGas: jest.fn().mockResolvedValue(1),
    } as unknown as Web3Provider;
  });

  it('should return gasEstimate for supported eip1159 txn', async () => {
    const txn = {
      maxFeePerGas: '0x1',
      maxPriorityFeePerGas: '0x1',
      gasPrice: '0x1',
      gasLimit: '0x1',
      to: '0x1',
      value: '0x1',
      data: '0x1',
    };

    const result = await getBridgeEstimatedGas(txn, provider, ChainId.ETHEREUM);

    expect(result.estimatedAmount).toEqual(BigNumber.from('0x02'));
    expect(result.token).toBeDefined();
    expect(result.token?.symbol).toEqual('ETH');
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

    const result = await getBridgeEstimatedGas(
      txn,
      provider,
      ChainId.ETHEREUM,
      approveTxn,
    );

    expect(result.estimatedAmount).toEqual(BigNumber.from('0x04'));
    expect(result.token).toBeDefined();
    expect(result.token?.symbol).toEqual('ETH');
  });

  it('should return gasEstimate for non-eip1159 txn', async () => {
    const txn = {
      gasPrice: '0x1',
      gasLimit: '0x1',
      to: '0x1',
      value: '0x1',
      data: '0x1',
    };

    const result = await getBridgeEstimatedGas(txn, provider, ChainId.ETHEREUM);

    expect(result.estimatedAmount).toEqual(BigNumber.from('0x01'));
    expect(result.token).toBeDefined();
    expect(result.token?.symbol).toEqual('ETH');
  });
});
