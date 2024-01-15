/* eslint-disable no-console */
import 'dotenv/config';

import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    ApproveBridgeRequest,
    ApproveBridgeResponse,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

async function getApprovalTxs() {

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

    const depositReq: ApproveBridgeRequest = {
      senderAddress: params.sender,
      token: params.rootToken,
      amount: params.amount,
      sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
      destinationChainId: bridgeConfig.bridgeInstance.childChainID,
    }

    console.log('depositReq', depositReq)

    try {
      const depositRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(depositReq);
      console.log('depositRes', depositRes);
    } catch(err) {
      console.error('depositErr', err);
    }

    const depositNativeReq: ApproveBridgeRequest = {
      senderAddress: params.sender,
      token: 'NATIVE',
      amount: params.amount,
      sourceChainId: bridgeConfig.bridgeInstance.rootChainID,
      destinationChainId: bridgeConfig.bridgeInstance.childChainID,
    }

    console.log('depositNativeReq', depositNativeReq)

    try {
      const depositNativeRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(depositNativeReq);
      console.log('depositNativeRes', depositNativeRes);
    } catch(err) {
      console.error('depositNativeErr', err);
    }

    const withdrawReq: ApproveBridgeRequest = {
      senderAddress: params.sender,
      token: params.childToken,
      amount: params.amount,
      sourceChainId: bridgeConfig.bridgeInstance.childChainID,
      destinationChainId: bridgeConfig.bridgeInstance.rootChainID,
    }

    console.log('withdrawReq', withdrawReq)

    try {
      const withdrawRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(withdrawReq);
      console.log('withdrawRes', withdrawRes);
    } catch(err) {
      console.error('withdrawErr', err);
    }

    const withdrawNativeReq: ApproveBridgeRequest = {
      senderAddress: params.sender,
      token: 'NATIVE',
      amount: params.amount,
      sourceChainId: bridgeConfig.bridgeInstance.childChainID,
      destinationChainId: bridgeConfig.bridgeInstance.rootChainID,
    }

    console.log('withdrawNativeReq', withdrawNativeReq)

    try {
      const withdrawNativeRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(withdrawNativeReq);
      console.log('withdrawNativeRes', withdrawNativeRes);
    } catch(err) {
      console.error('withdrawNativeErr', err);
    }
}

(async () => {
    try {
        await getApprovalTxs()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();