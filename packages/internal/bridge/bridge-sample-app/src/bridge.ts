/* eslint-disable no-console */
import 'dotenv/config';

import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    ETH_SEPOLIA_TO_ZKEVM_TESTNET,
    ETH_SEPOLIA_CHAIN_ID,
    ZKEVM_TESTNET_CHAIN_ID,
    ApproveBridgeRequest,
    ApproveBridgeResponse,
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
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
      rootProvider: params.rootProvider,
      childProvider: params.childProvider,
    });

    const tokenBridge = new TokenBridge(bridgeConfig);

    const depositReq: BridgeTxRequest = {
      senderAddress: params.depositor,
      recipientAddress: params.recipient,
      token: params.sepoliaToken,
      amount: params.amount,
      sourceChainId: ETH_SEPOLIA_CHAIN_ID,
      destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
      gasMultiplier: 1.1,
    }

    console.log('depositReq', depositReq)

    try {
      const depositRes: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(depositReq);
      console.log('depositRes', depositRes);
    } catch(err) {
      console.log('depositErr', err);
    }

    const depositNativeReq: BridgeTxRequest = {
      senderAddress: params.depositor,
      recipientAddress: params.recipient,
      token: 'NATIVE',
      amount: params.amount,
      sourceChainId: ETH_SEPOLIA_CHAIN_ID,
      destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
      gasMultiplier: 1.1,
    }

    console.log('depositNativeReq', depositNativeReq)

    try {
      const depositNativeRes: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(depositNativeReq);
      console.log('depositNativeRes', depositNativeRes);
    } catch(err) {
      console.log('depositNativeErr', err);
    }

    const withdrawReq: BridgeTxRequest = {
      senderAddress: params.depositor,
      recipientAddress: params.recipient,
      token: params.sepoliaToken,
      amount: params.amount,
      sourceChainId: ZKEVM_TESTNET_CHAIN_ID,
      destinationChainId: ETH_SEPOLIA_CHAIN_ID,
      gasMultiplier: 1.1,
    }

    console.log('withdrawReq', withdrawReq)

    try {
      const withdrawRes: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(withdrawReq);
      console.log('withdrawRes', withdrawRes);
    } catch(err) {
      console.log('withdrawErr', err);
    }

    const withdrawNativeReq: BridgeTxRequest = {
      senderAddress: params.depositor,
      recipientAddress: params.recipient,
      token: 'NATIVE',
      amount: params.amount,
      sourceChainId: ZKEVM_TESTNET_CHAIN_ID,
      destinationChainId: ETH_SEPOLIA_CHAIN_ID,
      gasMultiplier: 1.1,
    }

    console.log('withdrawNativeReq', withdrawNativeReq)

    try {
      const withdrawNativeRes: BridgeTxResponse = await tokenBridge.getUnsignedBridgeTx(withdrawNativeReq);
      console.log('withdrawNativeRes', withdrawNativeRes);
    } catch(err) {
      console.log('withdrawNativeErr', err);
    }
}

(async () => {
    try {
        await getBridgeTxs()
        console.log('Exiting successfully');
    } catch(err) {
        console.log('Exiting with error', err)
    }
})();