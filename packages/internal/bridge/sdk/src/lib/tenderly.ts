/* eslint-disable @typescript-eslint/naming-convention */

import axios, { AxiosResponse } from 'axios';
import { BridgeError, BridgeErrorType } from '../errors';
import { TenderlySimulation, TenderlyResult } from '../types/tenderly';
import { getTenderlyEndpoint } from './utils';

// In the Tenderly API, state objects are mapping of contract address -> "stateDiff" -> slot -> value
// We can make a type that is like: { contract address, {storageSlot: value} }, since the "stateDiff" key is always the same
export type StateObject = {
  contractAddress: string;
  stateDiff: StateDiff;
};

export type StateDiff = {
  storageSlot: string;
  value: string;
};

type Input = {
  name: string;
  value: string | boolean;
};

type Event = {
  name: string;
  inputs: Array<Input>;
};

type Trace = {
  method: string;
  output: string | number;
};

const THRESHOLD_SELECTOR = '0x84a3291a0';

/**
 * We want to convert a StateObject type to the following format (Record<string, Record<string, Record<string, string>>>):
 * @example An example of a state object that changes the state at slot 0xe1b959...2585e to 1 at address 0xe43215...8E31:
 *  {
 *    "0xe432150cce91c13a887f7D836923d5597adD8E31": {
 *      "stateDiff": {
 *        "0xe1b959a280d5c994e402bc258b5edd82e525f0ef1de9e4c9c7e7e184b2f2585e":
 *            "0x0000000000000000000000000000000000000000000000000000000000000001"
 *      }
 *    }
 *  }
 */
export function unwrapStateObjects(
  stateObjects: StateObject[],
): Record<string, Record<string, Record<string, string>>> {
  const unwrappedStateObjects: Record<string, Record<string, Record<string, string>>> = {};

  stateObjects.forEach((stateObject) => {
    const { contractAddress, stateDiff } = stateObject;
    const { storageSlot, value } = stateDiff;
    if (unwrappedStateObjects[contractAddress] === undefined) {
      unwrappedStateObjects[contractAddress] = {
        stateDiff: {},
      };
    }
    unwrappedStateObjects[contractAddress].stateDiff[storageSlot] = value;
  });

  return unwrappedStateObjects;
}

/**
 * Submits tenderly simulations, returning an array of gas usage estimates
 * @param chainId ID of network to estimate transactions on
 * @param simulations Array of TenderlySimulation objects (transactions) to estimate gas usage for
 * @param stateObjects An array of `StateObject`s. Each `StateObject` represents one smart contract state change.
 *                     These `StateObject`s get unwrapped into Tenderly's required format.
 * @returns Array of gas usage estimates.
 */
export async function submitTenderlySimulations(
  chainId: string,
  simulations: Array<TenderlySimulation>,
  stateObjects?: StateObject[],
): Promise<TenderlyResult> {
  let axiosResponse: AxiosResponse;
  const tenderlyAPI = getTenderlyEndpoint(chainId);
  const state_objects = stateObjects ? unwrapStateObjects(stateObjects) : undefined;
  try {
    axiosResponse = await axios.post(
      tenderlyAPI,
      {
        jsonrpc: '2.0',
        id: 0,
        method: 'tenderly_simulateBundle',
        params: [
          simulations,
          'latest',
          state_objects,
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error: any) {
    axiosResponse = error.response;
  }

  if (axiosResponse.data.error) {
    throw new BridgeError(
      `Estimating gas failed with the reason: ${axiosResponse.data.error.message}`,
      BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
    );
  }

  const simResults = axiosResponse.data.result;
  if (simResults.length !== simulations.length) {
    throw new BridgeError(
      'Estimating gas failed with mismatched responses',
      BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
    );
  }

  const gas: Array<number> = [];
  let delayWithdrawalLargeAmount: boolean = false;
  let delayWithdrawalUnknownToken: boolean = false;
  let withdrawalQueueActivated: boolean = false;
  let largeTransferThresholds: number = 0;
  let skipReadOperation = false;

  // Check if simulations are for token withdrawal
  const withdrawal = simulations.find((e: TenderlySimulation) => e.data?.startsWith(THRESHOLD_SELECTOR)) !== undefined;
  for (let i = 0; i < simResults.length; i++) {
    if (simResults[i].error) {
      throw new BridgeError(
        `Estimating deposit gas failed with the reason: ${simResults[i].error.message}`,
        BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
      );
    }
    if (simResults[i].gasUsed === undefined) {
      throw new BridgeError(
        'Estimating gas did not return simulation results',
        BridgeErrorType.TENDERLY_GAS_ESTIMATE_FAILED,
      );
    }
    // Attempt to extract event.
    if (withdrawal && simResults[i].logs !== undefined) {
      const event = simResults[i].logs.find((e: Event) => e.name === 'QueuedWithdrawal');
      if (event !== undefined) {
        const inputs: Map<string, string | boolean> = new Map(event.inputs.map((c: Input) => [c.name, c.value]));
        delayWithdrawalLargeAmount = inputs.get('delayWithdrawalLargeAmount') as boolean || false;
        delayWithdrawalUnknownToken = inputs.get('delayWithdrawalUnknownToken') as boolean || false;
        withdrawalQueueActivated = inputs.get('withdrawalQueueActivated') as boolean || false;
      }
    }
    // Check read operation.
    if (withdrawal && simResults[i].trace !== undefined) {
      const trace: Trace = simResults[i].trace.find((e: Trace) => e.method === 'largeTransferThresholds');
      if (trace !== undefined) {
        largeTransferThresholds = trace.output as number;
        skipReadOperation = true;
      }
    }
    if (!skipReadOperation) {
      gas.push(simResults[i].gasUsed);
    }
  }

  return {
    gas,
    delayWithdrawalLargeAmount,
    delayWithdrawalUnknownToken,
    withdrawalQueueActivated,
    largeTransferThresholds,
  };
}
