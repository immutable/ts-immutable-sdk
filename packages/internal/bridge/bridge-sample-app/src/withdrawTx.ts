/* eslint-disable no-console */
import 'dotenv/config';

import { ImmutableConfiguration, Environment } from '@imtbl/config';

import { 
    TokenBridge, 
    BridgeConfiguration, 
    FlowRateWithdrawRequest,
    FlowRateWithdrawResponse,
} from '@imtbl/bridge-sdk';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

async function getFlowRateWithdrawTx() {

  const params = await setupForBridge();

  if (!process.env.FLOW_RATE_INDEX) {
    throw new Error('FLOW_RATE_INDEX not set');
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

    const flowRateWithdrawReq: FlowRateWithdrawRequest = {
      recipient: params.recipient,
      index: parseInt(process.env.FLOW_RATE_INDEX, 10),
    }

    console.log('flowRateWithdrawReq', flowRateWithdrawReq)

    try {
      const flowRateWithdrawRes: FlowRateWithdrawResponse = await tokenBridge.getFlowRateWithdrawTx(flowRateWithdrawReq);
      console.log('flowRateWithdrawRes', flowRateWithdrawRes);
    } catch(err) {
      console.error('flowRateWithdrawErr', err);
      throw(err);
    }

}

(async () => {
    try {
        await getFlowRateWithdrawTx()
        console.log('Exiting successfully');
    } catch(err) {
        console.error('Exiting with error', err)
    }
})();