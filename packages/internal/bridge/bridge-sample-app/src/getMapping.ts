/* eslint-disable no-console */
import 'dotenv/config';
import util from 'util';
import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { 
    TokenBridge, 
    BridgeConfiguration, 
    TokenMappingRequest,
    TokenMappingResponse,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
import { delay, getContract, waitForReceipt } from './lib/helpers.js';

async function status() {

  const params = await setupForBridge();

  if (!process.env.GET_MAPPING_ROOT_TOKEN) {
    throw new Error('GET_MAPPING_ROOT_TOKEN not set');
  }

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    bridgeInstance: params.bridgeInstance,
    rootProvider: params.rootProvider,
    childProvider: params.childProvider,
  });

  const tokenBridge = new TokenBridge(bridgeConfig);

  const tokenMappingRootReq:TokenMappingRequest = {
    rootToken: process.env.GET_MAPPING_ROOT_TOKEN,
    rootChainId: bridgeConfig.bridgeInstance.rootChainID,
    childChainId: bridgeConfig.bridgeInstance.childChainID,
  }

  console.log('tokenMappingRootReq', tokenMappingRootReq);
  
  const tokenMappingRootRes: TokenMappingResponse = await tokenBridge.getTokenMapping(tokenMappingRootReq);
  console.log('tokenMappingRootRes');
  console.log(util.inspect(tokenMappingRootRes, {showHidden: false, depth: null, colors: true}));  

}

(async () => {
    try {
        await status()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();