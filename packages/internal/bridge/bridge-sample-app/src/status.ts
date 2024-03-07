/* eslint-disable no-console */
import 'dotenv/config';
import util from 'util';
import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { 
    TokenBridge, 
    BridgeConfiguration, 
    TxStatusResponse,
    TxStatusRequest,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
import { delay, getContract, waitForReceipt } from './lib/helpers.js';

async function status() {

  const params = await setupForBridge();

  if (!process.env.STATUS_TX_HASH) {
    throw new Error('STATUS_TX_HASH not set');
  }

  if (!process.env.STATUS_SOURCE_CHAIN_ID) {
    throw new Error('STATUS_SOURCE_CHAIN_ID not set');
  }

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: params.environment,
    }),
    bridgeInstance: params.bridgeInstance,
    rootProvider: params.rootProvider,
    childProvider: params.childProvider,
  });

  const tokenBridge = new TokenBridge(bridgeConfig);

  const txStatusReq:TxStatusRequest = {
    sourceChainId: process.env.STATUS_SOURCE_CHAIN_ID,
    transactions: [{
      txHash: process.env.STATUS_TX_HASH
    }]
  }

  console.log('txStatusReq', txStatusReq);
  
  const txStatusRes: TxStatusResponse = await tokenBridge.getTransactionStatus(txStatusReq);
  console.log('txStatusRes');
  console.log(util.inspect(txStatusRes, {showHidden: false, depth: null, colors: true}));  
}

(async () => {
    try {
        await status()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();