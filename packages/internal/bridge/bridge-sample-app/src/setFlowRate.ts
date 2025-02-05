/* eslint-disable no-console */
import 'dotenv/config';
import util from 'util';

import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    FlowRateInfoRequest,
    FlowRateInfoResponse,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';
import { getContract } from './lib/helpers.js';
import { Contract, parseUnits, TransactionRequest } from 'ethers';

async function getFlowRateInfo() {

  const params = await setupForBridge();

  if (!process.env.FLOW_RATE_TOKEN) {
    throw new Error('FLOW_RATE_TOKEN not set');
  }
  if (!process.env.FLOW_RATE_TOKEN_DECIMALS) {
    throw new Error('FLOW_RATE_TOKEN_DECIMALS not set');
  }
  if (!process.env.FLOW_RATE_CAPACITY) {
    throw new Error('FLOW_RATE_CAPACITY not set');
  }
  if (!process.env.FLOW_RATE_REFILL_RATE) {
    throw new Error('FLOW_RATE_REFILL_RATE not set');
  }
  if (!process.env.FLOW_RATE_LARGE_TRANSFER_THRESHOLD) {
    throw new Error('FLOW_RATE_LARGE_TRANSFER_THRESHOLD not set');
  }
  if (!process.env.FLOW_RATE_ROOT_CHAIN_ID) {
    throw new Error('FLOW_RATE_ROOT_CHAIN_ID not set');
  }

  const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: params.bridgeInstance,
      rootProvider: params.rootProvider,
      childProvider: params.childProvider,
    });

    const rootBridge: Contract = getContract("RootERC20BridgeFlowRate", params.rootBridgeAddress, params.rootProvider);

    const capacity = parseUnits(process.env.FLOW_RATE_CAPACITY, process.env.FLOW_RATE_TOKEN_DECIMALS);
    const refillRate = parseUnits(process.env.FLOW_RATE_REFILL_RATE, process.env.FLOW_RATE_TOKEN_DECIMALS);
    const largeTransferThreshold = parseUnits(process.env.FLOW_RATE_LARGE_TRANSFER_THRESHOLD, process.env.FLOW_RATE_TOKEN_DECIMALS);

    try {

      const data: string = await rootBridge.interface
      .encodeFunctionData('setRateControlThreshold', [
        process.env.FLOW_RATE_TOKEN,
        capacity,
        refillRate,
        largeTransferThreshold,
      ]);

      const unsignedTx: TransactionRequest = {
        data,
        to: params.rootBridgeAddress,
        value: 0,
        chainId: parseInt(process.env.FLOW_RATE_ROOT_CHAIN_ID, 10),
      };
      console.log('-----------------------------------------------------------');
      console.log('token ', process.env.FLOW_RATE_TOKEN);
      console.log('capacity ', capacity.toString());
      console.log('refillRate ', refillRate.toString());
      console.log('largeTransferThreshold ', largeTransferThreshold.toString());
      console.log('-----------------------------------------------------------');
      console.log('unsigned transaction:');
      console.log('-----------------------------------------------------------');
      console.log(util.inspect(unsignedTx, {showHidden: false, depth: null, colors: true}));
      console.log('-----------------------------------------------------------');

    } catch(err) {
      console.error('flowRateInfoErr', err);
      throw(err);
    }

}

(async () => {
    try {
        await getFlowRateInfo()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();