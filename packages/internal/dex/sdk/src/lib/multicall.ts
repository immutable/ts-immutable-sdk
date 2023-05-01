import { BigNumber } from 'ethers';
import { Interface } from '@ethersproject/abi';
import {
  Multicall,
  UniswapInterfaceMulticall,
} from '../contracts/types/Multicall';
import { UniswapV3Pool__factory } from '../contracts/types';

type Address = string;
export type SingleContractCallOptions = {
  gasRequired: number | undefined;
};

export type MulticallResponse = {
  blockNumber: BigNumber;
  returnData: UniswapInterfaceMulticall.ResultStructOutput[];
};

// TODO: Better description of function and args
export async function multicallSingleCallDataMultipleContracts(
  multicallContract: Multicall,
  functionName: string,
  addresses: Address[]
): Promise<MulticallResponse> {
  // Encode args - generate calldata for contract
  const contractIFace = UniswapV3Pool__factory.createInterface();
  const callData = getCallData(functionName, contractIFace);

  let calls: UniswapInterfaceMulticall.CallStruct[] = [];

  if (callData) {
    addresses.forEach((address) => {
      if (address) {
        calls.push({
          target: address,
          callData: callData,
          gasLimit: BigNumber.from('1000000'),
        });
      }
    });
  }

  // static call to multicall contract with encoded args
  return await multicallContract.callStatic.multicall(calls);
}

// TODO: Better description of function and args
export async function multicallMultipleCallDataSingContract(
  multicallContract: Multicall,
  calldata: string[],
  address: Address,
  options: SingleContractCallOptions
): Promise<MulticallResponse> {
  // Create call objects
  const calls = new Array(calldata.length);
  for (const i in calldata) {
    calls[i] = {
      target: address,
      callData: calldata[i],
      gasLimit: options.gasRequired,
    };
  }

  return await multicallContract.callStatic.multicall(calls);
}

const getCallData = (
  methodName: string,
  contractInterface: Interface | null | undefined
): string | undefined => {
  // Create ethers function fragment
  const fragment = contractInterface?.getFunction(methodName);

  return fragment ? contractInterface?.encodeFunctionData(fragment) : undefined;
};
