import { BigNumber, ethers } from 'ethers';
import { BridgeFeeActions, BridgeFeeResponse } from '@imtbl/bridge-sdk';
import {
  ChainId,
} from '../../../types';
import { CheckoutConfiguration } from '../../../config';
import { CheckoutError, CheckoutErrorType } from '../../../errors';
import * as instance from '../../../instance';

export const getBridgeFeeEstimate = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  fromChainId: ChainId,
  toChainId: ChainId,
): Promise<BridgeFeeResponse & { approvalGas: BigNumber; }> => {
  const bridge = instance.createBridgeInstance(
    fromChainId,
    toChainId,
    readOnlyProviders,
    config,
  );

  try {
    const fee = await bridge.getFee(
      {
        action: BridgeFeeActions.DEPOSIT,
        gasMultiplier: 1.1,
        sourceChainId: fromChainId.toString(),
        destinationChainId: toChainId.toString(),
      },
    );

    fee.approvalGas = BigNumber.from(0);

    return fee;
  } catch (err: any) {
    throw new CheckoutError(
      'Error estimating gas for bridge',
      CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR,
      { message: err.message },
    );
  }
};
