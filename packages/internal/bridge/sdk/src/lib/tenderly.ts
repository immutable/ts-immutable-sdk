/* eslint-disable @typescript-eslint/naming-convention */

import axios, { AxiosResponse } from 'axios';
import { BridgeError, BridgeErrorType } from 'errors';
import { TenderlySimulation } from 'types/tenderly';
import { getTenderlyEndpoint } from './utils';

// TODO generate a type for these state objects. Readability could be improved from the double nested Record
/**
 * Submits tenderly simulations, returning an array of gas usage estimates
 * @param chainId ID of network to estimate transactions on
 * @param simulations Array of TenderlySimulation objects (transactions) to estimate gas usage for
 * @param state_objects A double-nested record which can be used to change the state of smart contracts in the simulation.
 * @returns Array of gas usage estimates.
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
export async function submitTenderlySimulations(
  chainId: string,
  simulations: Array<TenderlySimulation>,
  state_objects?: Record<string, Record<string, Record<string, string>>>,
): Promise<Array<number>> {
  let axiosResponse:AxiosResponse;
  const tenderlyAPI = getTenderlyEndpoint(chainId);
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
