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
      environment: params.environment,
    }),
    bridgeInstance: params.bridgeInstance,
    rootProvider: params.rootProvider,
    childProvider: params.childProvider,
  });

  const tokenBridge = new TokenBridge(bridgeConfig);

  const tokenMappingReq:TokenMappingRequest = {
    rootToken: process.env.GET_MAPPING_ROOT_TOKEN,
    rootChainId: bridgeConfig.bridgeInstance.rootChainID,
    childChainId: bridgeConfig.bridgeInstance.childChainID,
  }

  console.log('tokenMappingReq', tokenMappingReq);
  
  const tokenMappingRes: TokenMappingResponse = await tokenBridge.getTokenMapping(tokenMappingReq);
  console.log('tokenMappingRootRes');
  console.log(util.inspect(tokenMappingRes, {showHidden: false, depth: null, colors: true}));  

  const tokenMappingETHReq:TokenMappingRequest = {
    rootToken: 'NATIVE',
    rootChainId: bridgeConfig.bridgeInstance.rootChainID,
    childChainId: bridgeConfig.bridgeInstance.childChainID,
  }

  console.log('tokenMappingETHReq', tokenMappingETHReq);
  
  const tokenMappingETHRes: TokenMappingResponse = await tokenBridge.getTokenMapping(tokenMappingETHReq);
  console.log('tokenMappingETHRes');
  console.log(util.inspect(tokenMappingETHRes, {showHidden: false, depth: null, colors: true}));  

  const tokenMappingWETHReq:TokenMappingRequest = {
    rootToken: bridgeConfig.bridgeContracts.rootChainWrappedETH,
    rootChainId: bridgeConfig.bridgeInstance.rootChainID,
    childChainId: bridgeConfig.bridgeInstance.childChainID,
  }

  console.log('tokenMappingWETHReq', tokenMappingWETHReq);
  
  const tokenMappingWETHRes: TokenMappingResponse = await tokenBridge.getTokenMapping(tokenMappingWETHReq);
  console.log('tokenMappingWETHRes');
  console.log(util.inspect(tokenMappingWETHRes, {showHidden: false, depth: null, colors: true}));  

  const tokenMappingIMXReq:TokenMappingRequest = {
    rootToken: bridgeConfig.bridgeContracts.rootChainIMX,
    rootChainId: bridgeConfig.bridgeInstance.rootChainID,
    childChainId: bridgeConfig.bridgeInstance.childChainID,
  }

  console.log('tokenMappingIMXReq', tokenMappingIMXReq);
  
  const tokenMappingIMXRes: TokenMappingResponse = await tokenBridge.getTokenMapping(tokenMappingIMXReq);
  console.log('tokenMappingIMXRes');
  console.log(util.inspect(tokenMappingIMXRes, {showHidden: false, depth: null, colors: true}));  

}

(async () => {
    try {
        await status()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();