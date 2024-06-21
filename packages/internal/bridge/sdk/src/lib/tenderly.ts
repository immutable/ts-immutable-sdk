/* eslint-disable @typescript-eslint/naming-convention */

import axios, { AxiosResponse } from 'axios';
import { BridgeError, BridgeErrorType } from '../errors';
import { TenderlySimulation } from '../types/tenderly';
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
): Promise<Array<number>> {
  let axiosResponse: AxiosResponse;
  const tenderlyAPI = getTenderlyEndpoint(chainId);
  const state_objects = stateObjects ? unwrapStateObjects(stateObjects) : undefined;
  try {
    axiosResponse = await axios.post(
      tenderlyAPI,
      {
        jsonrpc: '2.0',
        id: 0,
        method: 'tenderly_estimateGasBundle',
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
    gas.push(simResults[i].gasUsed);
  }

  return gas;
}
