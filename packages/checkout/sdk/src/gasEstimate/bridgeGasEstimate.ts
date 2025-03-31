import {
  BridgeFeeActions,
  BridgeFeeResponse,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { CheckoutConfiguration } from '../config';
import { ChainId } from '../types';
import { NATIVE } from '../env/constants';

export async function getBridgeFeeEstimate(
  tokenBridge: TokenBridge,
  fromChainId: ChainId,
  toChainId: ChainId,
  config: CheckoutConfiguration,
): Promise<BridgeFeeResponse> {
  const bridgeFeeAction = fromChainId === config.l1ChainId
    ? BridgeFeeActions.DEPOSIT
    : BridgeFeeActions.WITHDRAW;

  return await tokenBridge.getFee({
    action: bridgeFeeAction,
    gasMultiplier: 'auto',
    sourceChainId: fromChainId.toString(),
    destinationChainId: toChainId.toString(),
    token: NATIVE.toUpperCase(),
    amount: BigInt(0),
  });
}
