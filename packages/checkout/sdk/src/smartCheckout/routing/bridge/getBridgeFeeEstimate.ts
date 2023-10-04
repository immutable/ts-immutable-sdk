import { BigNumber, ethers } from 'ethers';
import { gasEstimator } from '../../../gasEstimate';
import {
  GasEstimateType,
  GasEstimateBridgeToL2Result,
  ChainId,
  BridgeRouteFeeEstimate,
  FundingStepType,
} from '../../../types';
import { CheckoutConfiguration } from '../../../config';
import { CheckoutError, CheckoutErrorType } from '../../../errors';

export const getBridgeFeeEstimate = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
): Promise<BridgeRouteFeeEstimate> => {
  try {
    const estimate = await gasEstimator(
      {
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        isSpendingCapApprovalRequired: false,
      },
      readOnlyProviders,
      config,
    ) as GasEstimateBridgeToL2Result;

    const gasEstimate = estimate.gasFee.estimatedAmount;
    const bridgeFee = estimate.bridgeFee.estimatedAmount;
    let totalFees = BigNumber.from(0);
    if (gasEstimate) totalFees = totalFees.add(gasEstimate);
    if (bridgeFee) totalFees = totalFees.add(bridgeFee);

    return {
      type: FundingStepType.BRIDGE,
      gasFee: {
        estimatedAmount: gasEstimate ?? BigNumber.from(0),
        token: estimate.gasFee.token,
      },
      bridgeFee: {
        estimatedAmount: bridgeFee ?? BigNumber.from(0),
        token: estimate.bridgeFee.token,
      },
      totalFees,
    };
  } catch (err: any) {
    throw new CheckoutError(
      'Error estimating gas for bridge',
      CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR,
      { message: err.message },
    );
  }
};
