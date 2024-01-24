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

async function getFlowRateInfo() {

  const params = await setupForBridge();

  if (!process.env.FLOW_RATE_INFO_TOKEN) {
    throw new Error('FLOW_RATE_INFO_TOKEN not set');
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

    const flowRateInfoReq: FlowRateInfoRequest = {
      tokens: ['NATIVE', process.env.FLOW_RATE_INFO_TOKEN],
    }

    console.log('flowRateInfoReq', flowRateInfoReq)

    try {
      const flowRateInfoRes: FlowRateInfoResponse = await tokenBridge.getFlowRateInfo(flowRateInfoReq);
      console.log('flowRateInfoRes');
      console.log(util.inspect(flowRateInfoRes, {showHidden: false, depth: null, colors: true}));
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