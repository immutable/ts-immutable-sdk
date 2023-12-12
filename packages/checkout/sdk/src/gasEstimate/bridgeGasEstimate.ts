import {
  BridgeFeeActions,
  BridgeFeeResponse,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { CheckoutConfiguration, getL1ChainId } from '../config';
import { ChainId } from '../types';

export async function getBridgeFeeEstimate(
  tokenBridge: TokenBridge,
  fromChainId: ChainId,
  toChainId: ChainId,
  config: CheckoutConfiguration,
): Promise<BridgeFeeResponse> {
  const bridgeFeeAction = fromChainId === getL1ChainId(config)
    ? BridgeFeeActions.DEPOSIT
    : BridgeFeeActions.WITHDRAW;

  return await tokenBridge.getFee({
    action: bridgeFeeAction,
    gasMultiplier: 1.1,
    sourceChainId: fromChainId.toString(),
    destinationChainId: toChainId.toString(),
  });
}
