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

  const depositReq: BridgeFeeRequest = {
    action: BridgeFeeActions.DEPOSIT,
    gasMultiplier: 1.1,
    sourceChainId: ETH_SEPOLIA_CHAIN_ID,
    destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
  }

  console.log('depositReq', depositReq)

  try {
    const depositRes: BridgeFeeResponse = await tokenBridge.getFee(depositReq);
    console.log('depositRes', depositRes);
  } catch(err) {
    console.error('depositErr', err);
  }

  const withdrawReq: BridgeFeeRequest = {
    action: BridgeFeeActions.WITHDRAW,
    gasMultiplier: 1.1,
    sourceChainId: ZKEVM_TESTNET_CHAIN_ID,
    destinationChainId: ETH_SEPOLIA_CHAIN_ID,
  }

  console.log('withdrawReq', withdrawReq)

  try {
    const withdrawRes: BridgeFeeResponse = await tokenBridge.getFee(withdrawReq);
    console.log('withdrawRes', withdrawRes);
  } catch(err) {
    console.error('withdrawErr', err);
  }

  const finalizeReq: BridgeFeeRequest = {
    action: BridgeFeeActions.FINALISE_WITHDRAWAL,
    sourceChainId: ETH_SEPOLIA_CHAIN_ID,
  }

  console.log('finalizeReq', finalizeReq)

  try {
    const finalizeRes: BridgeFeeResponse = await tokenBridge.getFee(finalizeReq);
    console.log('finalizeRes', finalizeRes);
  } catch(err) {
    console.error('finalizeErr', err);
  }
}

(async () => {
    try {
        await getBridgeFees()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();