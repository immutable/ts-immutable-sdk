import { BridgeFeeActions, BridgeFeeResponse } from '@imtbl/bridge-sdk';
import { JsonRpcProvider } from 'ethers';
import {
  ChainId,
} from '../../../types';
import { CheckoutConfiguration } from '../../../config';
import { CheckoutError, CheckoutErrorType } from '../../../errors';
import * as instance from '../../../instance';

export const getBridgeFeeEstimate = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, JsonRpcProvider>,
  fromChainId: ChainId,
  toChainId: ChainId,
): Promise<BridgeFeeResponse & { approvalGas: bigint; }> => {
  const bridge = instance.createBridgeInstance(
    fromChainId,
    toChainId,
    readOnlyProviders,
    config,
  );

  try {
    const bridgeFeeResponse = await bridge.getFee(
      {
        action: BridgeFeeActions.DEPOSIT,
        gasMultiplier: 'auto',
        sourceChainId: fromChainId.toString(),
        destinationChainId: toChainId.toString(),
      },
    );

    return {
      ...bridgeFeeResponse,
      approvalGas: BigInt(0),
    };
  } catch (err: any) {
    throw new CheckoutError(
      'Error estimating gas for bridge',
      CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR,
      { error: err },
    );
  }
};
