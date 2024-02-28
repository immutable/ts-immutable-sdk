/* eslint-disable no-console */
import 'dotenv/config';

import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    BridgeFeeRequest, 
    BridgeFeeResponse,
    BridgeFeeActions,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

async function getBridgeFees() {

  const params = await setupForBridge();

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    bridgeInstance: params.bridgeInstance,
    rootProvider: params.rootProvider,
    childProvider: params.childProvider,
  });


  const tokenBridge = new TokenBridge(bridgeConfig);

  const depositReq: BridgeFeeRequest = {
    action: BridgeFeeActions.DEPOSIT,
    gasMultiplier: 1.1,
    sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
    destinationChainId: bridgeConfig.bridgeInstance.childChainID,
    amount: params.amount,
    token: params.rootToken,
    senderAddress: params.sender,
    recipientAddress: params.recipient,
  }

  console.log('depositReq', depositReq);

  const depositRes: BridgeFeeResponse = await tokenBridge.getFee(depositReq);
  console.log('depositRes', depositRes);


  const withdrawReq: BridgeFeeRequest = {
    action: BridgeFeeActions.WITHDRAW,
    gasMultiplier: 1.1,
    sourceChainId: bridgeConfig.bridgeInstance.childChainID,
    destinationChainId: bridgeConfig.bridgeInstance.rootChainID,
    amount: params.amount,
    token: params.childToken,
    senderAddress: params.sender,
    recipientAddress: params.recipient,
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
    sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
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