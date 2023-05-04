import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { TokenBridge } from 'tokenBridge';
import { BridgeConfiguration } from 'config';
import { ETH_SEPOLIA_TO_ZKEVM_DEVNET } from 'constants/bridges';
import { BridgeDepositRequest, BridgeDepositResponse } from 'types';
import { ethers } from 'ethers';

describe('Token Bridge', () => {
  it('Constructor works correctly', async () => {
    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
    });
    new TokenBridge(bridgeConfig);
  });
  describe('getUnsignedDepositTokenTx', () => {
    let tokenBridge: TokenBridge;
    let bridgeConfig: BridgeConfiguration;
    beforeEach(() => {
      bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
      });
      tokenBridge = new TokenBridge(bridgeConfig);
    });

    it('ERC20 with valid arguments is successful', async () => {
      const depositorAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const recipientAddress = '0x3095171469a0db24D9Fb9C789D62dF22BBAfa816';
      const token = '0x2f14582947E292a2eCd20C430B46f2d27CFE213c';
      const depositAmount = ethers.utils.parseUnits('0.01', 18);
      const request: BridgeDepositRequest = {
        depositorAddress,
        depositAmount,
        recipientAddress,
        token,
      };
      const response: BridgeDepositResponse =
        await tokenBridge.getUnsignedDepositTokenTx(request);
      expect(response.unsignedTx.from).toBe(depositorAddress);
      expect(response.unsignedTx.to).toBe(
        bridgeConfig.bridgeContracts.rootChainERC20Predicate
      );
      expect(response.unsignedTx.value).toBe(0);
      expect(response.unsignedTx.data).not.toBeNull();
    });
  });
});
