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
  senderAddress: string,
  amount: BigNumber,
  tokenAddress: string,
): Promise<BridgeFeeResponse & { approvalGas: BigNumber; }> => {
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
        gasMultiplier: 1.1,
        sourceChainId: fromChainId.toString(),
        destinationChainId: toChainId.toString(),
        token: tokenAddress,
        amount,
        senderAddress,
        recipientAddress: senderAddress,
      },
    );

    return {
      ...bridgeFeeResponse,
      approvalGas: BigNumber.from(0),
    };
  } catch (err: any) {
    throw new CheckoutError(
      'Error estimating gas for bridge',
      CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR,
      { error: err },
    );
  }
};
