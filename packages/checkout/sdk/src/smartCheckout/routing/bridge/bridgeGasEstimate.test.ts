import { BigNumber, ethers } from 'ethers';
import { Environment } from '@imtbl/config';
import { gasEstimator } from '../../../gasEstimate';
import { ChainId, GasEstimateBridgeToL2Result } from '../../../types';
import { bridgeGasEstimate } from './bridgeGasEstimate';
import { CheckoutConfiguration } from '../../../config';
import { CheckoutErrorType } from '../../../errors';

jest.mock('../../../gasEstimate');

describe('bridgeGasEstimate', () => {
  const readOnlyProviders = new Map<ChainId, ethers.providers.JsonRpcProvider>([]);
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

  it('should return the total fees for the bridge', async () => {
    (gasEstimator as jest.Mock).mockResolvedValue({
      gasFee: {
        estimatedAmount: BigNumber.from(1),
      },
      bridgeFee: {
        estimatedAmount: BigNumber.from(2),
      },
    } as GasEstimateBridgeToL2Result);

    const bridgeFee = await bridgeGasEstimate(config, readOnlyProviders);
    expect(bridgeFee).toEqual(BigNumber.from(3));
  });

  it('should throw checkout error if gas estimator errors', async () => {
    (gasEstimator as jest.Mock).mockRejectedValue(new Error('error from gas estimator'));

    let type;
    let data;

    try {
      await bridgeGasEstimate(config, readOnlyProviders);
    } catch (err: any) {
      type = err.type;
      data = err.data;
    }

    expect(type).toEqual(CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR);
    expect(data).toEqual({ message: 'error from gas estimator' });
  });
});
