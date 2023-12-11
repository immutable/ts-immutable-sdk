/* eslint-disable no-console */
import 'dotenv/config';
import { ethers } from "ethers";
import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    ETH_SEPOLIA_TO_ZKEVM_TESTNET,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
// @ts-ignore
import {delay, getContract, waitForReceipt, waitUntilSucceed} from './lib/helpers.ts';

async function mapToken() {

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

  if (!process.env.ROOT_TOKEN_TO_MAP) {
    throw new Error('ROOT_TOKEN_TO_MAP not set');
  }

  if (!process.env.AXELAR_API_URL) {
    throw new Error('AXELAR_API_URL not set');
  }

  if (!process.env.ROOT_BRIDGE_ADDRESS) {
    throw new Error('ROOT_BRIDGE_ADDRESS not set');
  }

  if (!process.env.CHILD_BRIDGE_ADDRESS) {
    throw new Error('CHILD_BRIDGE_ADDRESS not set');
  }

  let axelarAPI: string = process.env.AXELAR_API_URL;
  let rootCustomTokenAddress: string = process.env.ROOT_TOKEN_TO_MAP;
  let childCustomToken: ethers.Contract;

  const rootBridge: ethers.Contract = getContract("RootERC20BridgeFlowRate", process.env.ROOT_BRIDGE_ADDRESS, params.rootProvider);
  const childBridge: ethers.Contract = getContract("ChildERC20Bridge", process.env.CHILD_BRIDGE_ADDRESS, params.childProvider);

  let childTokenAddress = await childBridge.rootTokenToChildToken(rootCustomTokenAddress);

  if (childTokenAddress != ethers.constants.AddressZero) {
      console.log("Custom token has already been mapped to child, skip.");
      console.log("childTokenAddress", childTokenAddress);
      return;
  }

  let rootTokenChildAddress = await rootBridge.rootTokenToChildToken(rootCustomTokenAddress);

  let expectedChildTokenAddr;

  if (rootTokenChildAddress != ethers.constants.AddressZero) {
      console.log("Custom token has already been mapped on root, wait for child mapping.");
      console.log("rootTokenChildAddress", rootTokenChildAddress);
      expectedChildTokenAddr = rootTokenChildAddress;
  } else {
    // Map token
    console.log("mapping token", );
    let bridgeFee = ethers.utils.parseEther("0.001");
    expectedChildTokenAddr = await rootBridge.callStatic.mapToken(rootCustomTokenAddress, {
        value: bridgeFee,
    });
    
    let resp = await rootBridge.connect(params.rootWallet).mapToken(rootCustomTokenAddress, {
        value: bridgeFee,
    })
    await waitForReceipt(resp.hash, params.rootProvider);

    childTokenAddress = await childBridge.rootTokenToChildToken(rootCustomTokenAddress);

    await waitUntilSucceed(axelarAPI, resp.hash);
  }

  let attempts = 0;
  while (childTokenAddress == ethers.constants.AddressZero) {
    attempts++;
    childTokenAddress = await childBridge.rootTokenToChildToken(rootCustomTokenAddress);
      console.log(`waiting for mapping to complete on childBridge attempt: ${attempts}`);
      await delay(10000);
  }
  childCustomToken = getContract("ChildERC20", childTokenAddress, params.childProvider);

  console.log(`expected token address: ${expectedChildTokenAddr}`);
  console.log(`child token address: ${childTokenAddress}`);

}

(async () => {
    try {
        await mapToken()
        console.log('Exiting successfully');
    } catch(err) {
        console.log('Exiting with error', err)
    }
})();