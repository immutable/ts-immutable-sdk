/* eslint-disable no-console */
import 'dotenv/config';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
// @ts-ignore
import {delay, getContract, waitForReceipt, waitUntilSucceed} from './lib/helpers.ts';
import { Contract, parseEther, ZeroAddress } from 'ethers';

async function mapToken() {

  const params = await setupForBridge();

  if (!process.env.ROOT_TOKEN_TO_MAP) {
    throw new Error('ROOT_TOKEN_TO_MAP not set');
  }

  if (!process.env.AXELAR_API_URL) {
    throw new Error('AXELAR_API_URL not set');
  }

  let axelarAPI: string = process.env.AXELAR_API_URL;
  let rootCustomTokenAddress: string = process.env.ROOT_TOKEN_TO_MAP;
  let childCustomToken: Contract;

  const rootBridge: Contract = getContract("RootERC20BridgeFlowRate", params.rootBridgeAddress, params.rootProvider);
  const childBridge: Contract = getContract("ChildERC20Bridge", params.childBridgeAddress, params.childProvider);

  let childTokenAddress = await childBridge.rootTokenToChildToken(rootCustomTokenAddress);

  if (childTokenAddress != ZeroAddress) {
      console.log("Custom token has already been mapped to child, skip.");
      console.log("childTokenAddress", childTokenAddress);
      return;
  }

  let rootTokenChildAddress = await rootBridge.rootTokenToChildToken(rootCustomTokenAddress);

  let expectedChildTokenAddr;

  if (rootTokenChildAddress != ZeroAddress) {
      console.log("Custom token has already been mapped on root, wait for child mapping.");
      console.log("rootTokenChildAddress", rootTokenChildAddress);
      expectedChildTokenAddr = rootTokenChildAddress;
  } else {
    // Map token
    console.log("mapping token", );
    let bridgeFee = parseEther("0.001");
    expectedChildTokenAddr = await rootBridge.mapToken.staticCall(rootCustomTokenAddress, {
        value: bridgeFee,
    });
    
    let resp = await (rootBridge.connect(params.rootWallet) as Contract).mapToken(rootCustomTokenAddress, {
        value: bridgeFee,
    })
    await waitForReceipt(resp.hash, params.rootProvider);

    childTokenAddress = await childBridge.rootTokenToChildToken(rootCustomTokenAddress);

    await waitUntilSucceed(axelarAPI, resp.hash);
  }

  let attempts = 0;
  while (childTokenAddress == ZeroAddress) {
    attempts++;
    childTokenAddress = await childBridge.rootTokenToChildToken(rootCustomTokenAddress);
      console.log(`waiting for mapping to complete on childBridge attempt: ${attempts}`);
      if (childTokenAddress == ZeroAddress) {
        await delay(10000);
      }
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
        console.error('Exiting with error', err)
    }
})();