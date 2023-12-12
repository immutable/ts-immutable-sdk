/* eslint-disable no-console */
import 'dotenv/config';

import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    ETH_SEPOLIA_TO_ZKEVM_TESTNET,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

async function withdraw() {

  const params = await setupForBridge();

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
    rootProvider: params.rootProvider,
    childProvider: params.childProvider,
  });

  const tokenBridge = new TokenBridge(bridgeConfig);

  console.log('Deposit smoke tests TBC');
}

(async () => {
    try {
        await withdraw()
        console.log('Exiting successfully');
    } catch(err) {
        console.log('Exiting with error', err)
    }
})();