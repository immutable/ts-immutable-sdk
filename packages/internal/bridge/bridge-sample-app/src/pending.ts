/* eslint-disable no-console */
import 'dotenv/config';
import { ethers } from "ethers";
import util from 'util';
import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { 
    TokenBridge, 
    BridgeConfiguration, 
    ETH_SEPOLIA_TO_ZKEVM_TESTNET,
    ApproveBridgeRequest,
    ApproveBridgeResponse,
    ETH_SEPOLIA_CHAIN_ID,
    ZKEVM_TESTNET_CHAIN_ID,
    BridgeTxRequest,
    BridgeTxResponse,
    TxStatusResponse,
    TxStatusRequest,
    StatusResponse,
    PendingWithdrawalsResponse,
    PendingWithdrawalsRequest,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
import { delay, getContract, waitForReceipt } from './lib/helpers.js';

async function pending() {

  const params = await setupForBridge();

  if (!process.env.STATUS_TX_HASH) {
    throw new Error('STATUS_TX_HASH not set');
  }

  if (!process.env.STATUS_SOURCE_CHAIN_ID) {
    throw new Error('STATUS_SOURCE_CHAIN_ID not set');
  }

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_TESTNET,
    rootProvider: params.rootProvider,
    childProvider: params.childProvider,
  });

  const tokenBridge = new TokenBridge(bridgeConfig);

  const pendingReq:PendingWithdrawalsRequest = {
    recipient: params.recipient,
  }

  console.log('pendingReq', pendingReq);

  const pendingRes: PendingWithdrawalsResponse = await tokenBridge.getPendingWithdrawals(pendingReq);
  console.log('pendingRes');
  console.log(util.inspect(pendingRes, {showHidden: false, depth: null, colors: true}));  
}

(async () => {
    try {
        await pending()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();