import { BigNumber } from 'ethers';
import { Multicall, UniswapInterfaceMulticall } from '../contracts/types/Multicall';

const DEFAULT_GAS_QUOTE = 23_000_000;

type Address = string;

export type SingleContractCallOptions = {
  gasRequired: number;
};

export type MulticallResponse = {
  blockNumber: BigNumber;
  returnData: UniswapInterfaceMulticall.ResultStructOutput[];
};

export const multicallContracts = (
  multicallContract: Multicall,
  callData: string,
  addresses: Address[],
): Promise<MulticallResponse> =>
  multicallContract.callStatic.multicall(
    addresses.map((address) => ({
      target: address,
      callData,
      gasLimit: BigNumber.from('1000000'),
    })),
  );

export const multicallContract = (
  multicall: Multicall,
  callDatas: string[],
  target: Address,
  options?: SingleContractCallOptions,
): Promise<MulticallResponse> =>
  multicall.callStatic.multicall(
    callDatas.map((callData) => ({
      target,
      callData,
      gasLimit: options?.gasRequired ?? DEFAULT_GAS_QUOTE,
    })),
  );
