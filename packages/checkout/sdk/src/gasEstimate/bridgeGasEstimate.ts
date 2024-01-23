import {
  BridgeFeeActions,
  BridgeFeeResponse,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { BigNumber } from 'ethers';
import { CheckoutConfiguration, getL1ChainId } from '../config';
import { ChainId } from '../types';
import { BRIDGE_GAS_MULTIPLIER, NATIVE } from '../env/constants';

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
    gasMultiplier: BRIDGE_GAS_MULTIPLIER,
    sourceChainId: fromChainId.toString(),
    destinationChainId: toChainId.toString(),
    token: NATIVE.toUpperCase(),
    amount: BigNumber.from(0),
  });
}
