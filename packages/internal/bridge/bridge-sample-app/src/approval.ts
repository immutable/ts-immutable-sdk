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
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

async function getApprovalTxs() {

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

    const depositReq: ApproveBridgeRequest = {
      senderAddress: params.sender,
      token: params.sepoliaToken,
      amount: params.amount,
      sourceChainId: ETH_SEPOLIA_CHAIN_ID,
      destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
    }

    console.log('depositReq', depositReq)

    try {
      const depositRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(depositReq);
      console.log('depositRes', depositRes);
    } catch(err) {
      console.log('depositErr', err);
    }

    const depositNativeReq: ApproveBridgeRequest = {
      senderAddress: params.sender,
      token: 'NATIVE',
      amount: params.amount,
      sourceChainId: ETH_SEPOLIA_CHAIN_ID,
      destinationChainId: ZKEVM_TESTNET_CHAIN_ID,
    }

    console.log('depositNativeReq', depositNativeReq)

    try {
      const depositNativeRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(depositNativeReq);
      console.log('depositNativeRes', depositNativeRes);
    } catch(err) {
      console.log('depositNativeErr', err);
    }

    const withdrawReq: ApproveBridgeRequest = {
      senderAddress: params.sender,
      token: params.zkevmTestnetToken,
      amount: params.amount,
      sourceChainId: ZKEVM_TESTNET_CHAIN_ID,
      destinationChainId: ETH_SEPOLIA_CHAIN_ID,
    }

    console.log('withdrawReq', withdrawReq)

    try {
      const withdrawRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(withdrawReq);
      console.log('withdrawRes', withdrawRes);
    } catch(err) {
      console.log('withdrawErr', err);
    }

    const withdrawNativeReq: ApproveBridgeRequest = {
      senderAddress: params.sender,
      token: 'NATIVE',
      amount: params.amount,
      sourceChainId: ZKEVM_TESTNET_CHAIN_ID,
      destinationChainId: ETH_SEPOLIA_CHAIN_ID,
    }

    console.log('withdrawNativeReq', withdrawNativeReq)

    try {
      const withdrawNativeRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx(withdrawNativeReq);
      console.log('withdrawNativeRes', withdrawNativeRes);
    } catch(err) {
      console.log('withdrawNativeErr', err);
    }
}

(async () => {
    try {
        await getApprovalTxs()
        console.log('Exiting successfully');
    } catch(err) {
        console.log('Exiting with error', err)
    }
})();