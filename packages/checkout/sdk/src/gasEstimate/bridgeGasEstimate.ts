import {
  BridgeFeeActions,
  BridgeFeeResponse,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { BigNumber } from 'ethers';
import { CheckoutConfiguration, getL1ChainId } from '../config';
import { ChainId } from '../types';
import { NATIVE } from '../env/constants';

export async function getBridgeFeeEstimate(
  tokenBridge: TokenBridge,
  fromChainId: ChainId,
  toChainId: ChainId,
  config: CheckoutConfiguration,
  amount?: string,
  tokenAddress?: string,
  senderAddress?: string,
  recipientAddress?: string,
): Promise<BridgeFeeResponse> {
  const bridgeFeeAction = fromChainId === getL1ChainId(config)
    ? BridgeFeeActions.DEPOSIT
    : BridgeFeeActions.WITHDRAW;

  return await tokenBridge.getFee({
    action: bridgeFeeAction,
    gasMultiplier: 1.1,
    sourceChainId: fromChainId.toString(),
    destinationChainId: toChainId.toString(),
    token: tokenAddress ?? NATIVE.toUpperCase(),
    amount: (amount) ? BigNumber.from(amount) : BigNumber.from(0),
    senderAddress: senderAddress ?? '0x0',
    recipientAddress: recipientAddress ?? '0x0',
  });
}
