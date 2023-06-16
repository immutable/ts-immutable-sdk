import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getBridgeEstimatedGas } from './bridgeGasEstimate';
import { ChainId } from '../types';

describe('getBridgeGasEstimate', () => {
  let provider: Web3Provider;

  beforeEach(() => {
    provider = {
      getFeeData: jest.fn().mockResolvedValue({
        maxFeePerGas: '0x1',
        maxPriorityFeePerGas: '0x1',
        gasPrice: null,
      }),
    } as unknown as Web3Provider;
  });

  it('should return gasEstimate for supported eip1159 txn', async () => {
    const result = await getBridgeEstimatedGas(provider, ChainId.ETHEREUM);

    expect(result.estimatedAmount).toEqual(BigNumber.from(280000));
    expect(result.token).toBeDefined();
    expect(result.token?.symbol).toEqual('ETH');
  });

  it('should return gas estimate for txn and approve txn', async () => {
    const result = await getBridgeEstimatedGas(
      provider,
      ChainId.ETHEREUM,
      true,
    );
    expect(result.estimatedAmount).toEqual(BigNumber.from(560000));
    expect(result.token).toBeDefined();
    expect(result.token?.symbol).toEqual('ETH');
  });

  it('should return gasEstimate for non-eip1159 txn', async () => {
    provider = {
      getFeeData: jest.fn().mockResolvedValue({
        gasPrice: '0x1',
      }),
    } as unknown as Web3Provider;

    const result = await getBridgeEstimatedGas(provider, ChainId.ETHEREUM);

    expect(result.estimatedAmount).toEqual(BigNumber.from(140000));
    expect(result.token).toBeDefined();
    expect(result.token?.symbol).toEqual('ETH');
  });
});
