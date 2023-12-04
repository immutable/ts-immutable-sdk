/* eslint-disable no-console */
import 'dotenv/config';

import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    ETH_SEPOLIA_TO_ZKEVM_TESTNET,
    BridgeFeeRequest, 
    BridgeFeeResponse,
    BridgeFeeActions,
    ETH_SEPOLIA_CHAIN_ID,
    ZKEVM_TESTNET_CHAIN_ID,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

async function getBridgeFees() {
    console.log('getBridgeFees');

    const params = await setupForBridge();

    console.log('params', params)

    const bridgeConfig = new BridgeConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
        rootProvider: params.rootProvider,
        childProvider: params.childProvider,
      });

      const tokenBridge = new TokenBridge(bridgeConfig);

      const depositReq: BridgeFeeRequest = {
        action: BridgeFeeActions.DEPOSIT,
        gasMultiplier: 1.1,
        sourceChainId: ETH_SEPOLIA_CHAIN_ID,
        destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
      }

      console.log('depositReq', depositReq)


      const depositRes: BridgeFeeResponse = await tokenBridge.getFee(depositReq);

      console.log('depositRes', depositRes)
}

(async () => {
    try {
        await getBridgeFees()
        console.log('Exiting successfully');
    } catch(err) {
        console.log('Exiting with error', err)
    }
})();