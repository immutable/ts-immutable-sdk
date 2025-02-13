import { TokenBridge } from '@imtbl/bridge-sdk';
import { getBridgeFeeEstimate } from './bridgeGasEstimate';
import { CheckoutConfiguration } from '../config';
import { ChainId } from '../types';

describe('getBridgeGasEstimate', () => {
  let tokenBridge: TokenBridge;
  let fromChainId: ChainId;
  let toChainId: ChainId;
  let config: CheckoutConfiguration;

  beforeEach(() => {
    tokenBridge = {
      getFee: jest.fn().mockResolvedValue({
        totalFees: BigInt(280000),
      }),
    } as unknown as TokenBridge;
    fromChainId = ChainId.ETHEREUM;
    toChainId = ChainId.IMTBL_ZKEVM_TESTNET;
    config = {
      l1ChainId: ChainId.ETHEREUM,
      l2ChainId: ChainId.IMTBL_ZKEVM_TESTNET,
    } as unknown as CheckoutConfiguration;
  });

  it('should return gas estimate for supported eip1159 txn', async () => {
    const result = await getBridgeFeeEstimate(tokenBridge, fromChainId, toChainId, config);

    expect(result.totalFees).toEqual(BigInt(280000));
  });
});
