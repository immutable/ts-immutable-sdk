/* eslint-disable no-console */
import 'dotenv/config';

import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    BridgeTxRequest,
    BridgeTxResponse,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

async function getBridgeTxs() {

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

    const depositReq: BridgeTxRequest = {
      senderAddress: params.sender,
      recipientAddress: params.recipient,
      token: params.rootToken,
      amount: params.amount,
      sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
      destinationChainId: bridgeConfig.bridgeInstance.childChainID,
      gasMultiplier: 'auto',
    }

    console.log('depositReq', depositReq)

    try {
      const depositRes: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(depositReq);
      console.log('depositRes', depositRes);
    } catch(err) {
      console.error('depositErr', err);
    }

    const depositNativeReq: BridgeTxRequest = {
      senderAddress: params.sender,
      recipientAddress: params.recipient,
      token: 'NATIVE',
      amount: params.amount,
      sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
      destinationChainId: bridgeConfig.bridgeInstance.childChainID,
      gasMultiplier: 'auto',
    }

    console.log('depositNativeReq', depositNativeReq)

    try {
      const depositNativeRes: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(depositNativeReq);
      console.log('depositNativeRes', depositNativeRes);
    } catch(err) {
      console.error('depositNativeErr', err);
    }

    const withdrawReq: BridgeTxRequest = {
      senderAddress: params.sender,
      recipientAddress: params.recipient,
      token: params.rootToken,
      amount: params.amount,
      sourceChainId: bridgeConfig.bridgeInstance.childChainID,
      destinationChainId: bridgeConfig.bridgeInstance.rootChainID,
      gasMultiplier: 'auto',
    }

    console.log('withdrawReq', withdrawReq)

    try {
      const withdrawRes: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(withdrawReq);
      console.log('withdrawRes', withdrawRes);
    } catch(err) {
      console.error('withdrawErr', err);
    }

    const withdrawNativeReq: BridgeTxRequest = {
      senderAddress: params.sender,
      recipientAddress: params.recipient,
      token: 'NATIVE',
      amount: params.amount,
      sourceChainId: bridgeConfig.bridgeInstance.childChainID,
      destinationChainId: bridgeConfig.bridgeInstance.rootChainID,
      gasMultiplier: 'auto',
    }

    console.log('withdrawNativeReq', withdrawNativeReq)

    try {
      const withdrawNativeRes: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(withdrawNativeReq);
      console.log('withdrawNativeRes', withdrawNativeRes);
    } catch(err) {
      console.error('withdrawNativeErr', err);
    }
}

(async () => {
    try {
        await getBridgeTxs()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();