import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { Exchange } from '@imtbl/dex-sdk';
import { gasServiceEstimator } from './gasServiceEstimator';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { GasEstimateType, GasEstimate } from '../types/gasEstimate';

describe('gasServiceEstimator', () => {
  let provider: Web3Provider;

  beforeEach(() => {
    provider = {
      getFeeData: jest.fn().mockResolvedValue({
        maxFeePerGas: '0x1',
        maxPriorityFeePerGas: '0x1',
        gasPrice: '0x1',
      }),
    } as unknown as Web3Provider;
  });

  it('should estimate gas for bridging L1 to L2', async () => {
    const result = await gasServiceEstimator({
      type: GasEstimateType.BRIDGE_TO_L2,
      provider,
      environment: Environment.SANDBOX,
    });
    expect(result.estimatedAmount).toEqual(BigNumber.from(280000));
    expect(result.token?.symbol).toEqual('ETH');
  });

  it('should return gas estimate for swap', async () => {
    const result = await gasServiceEstimator({
      type: GasEstimateType.SWAP,
      environment: Environment.PRODUCTION,
      exchange: {
        getUnsignedSwapTxFromAmountIn: jest.fn().mockResolvedValue({
          info: {
            gasFeeEstimate: {
              amount: BigNumber.from(1),
              token: {
                address: '0x1',
                symbol: 'TEST',
                name: 'TEST',
                decimals: 18,
              },
            },
          },
        }),
      } as unknown as Exchange,
    });

    expect(result.estimatedAmount).toEqual(BigNumber.from(1));
    expect(result.token?.address).toEqual('0x1');
    expect(result.token?.symbol).toEqual('TEST');
    expect(result.token?.name).toEqual('TEST');
    expect(result.token?.decimals).toEqual(18);
  });

  it('should throw error for invalid gasEstimateType', async () => {
    await expect(
      gasServiceEstimator({
        type: 'INVALID' as GasEstimateType,
      } as GasEstimate),
    ).rejects.toThrow(
      new CheckoutError(
        'Invalid type provided for gasEstimateType',
        CheckoutErrorType.INVALID_GAS_ESTIMATE_TYPE,
      ),
    );
  });
});
